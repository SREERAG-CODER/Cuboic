import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { StockInDto, StockAdjustDto } from './dto/stock-operations.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  // ── Item CRUD ────────────────────────────────────────────────────────────

  create(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({ data: dto });
  }

  findAll(outletId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { outletId },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findLowStock(outletId: string) {
    const items = await this.prisma.inventoryItem.findMany({ where: { outletId } });
    return items.filter((i) => i.currentStock <= i.reorderLevel);
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async update(id: string, data: Partial<CreateInventoryItemDto>) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  async bulkUpdate(outletId: string, updates: Array<{ id: string; data: Partial<CreateInventoryItemDto> }>) {
    const results = await this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.inventoryItem.update({
          where: { id: u.id, outletId }, // Safety check: must belong to the outlet
          data: u.data,
        }),
      ),
    );
    this.eventsGateway.emitToRestaurant(outletId, 'inventory:bulk-updated', { count: results.length });
    return results;
  }

  // ── Stock In (Procurement) ───────────────────────────────────────────────

  async stockIn(id: string, dto: StockInDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');

    const newStock = item.currentStock + dto.quantity;

    // Weighted Average Cost update
    let newCost = item.costPerUnit;
    if (dto.costPerUnit !== undefined && dto.costPerUnit > 0) {
      const totalExistingValue = item.currentStock * item.costPerUnit;
      const incomingValue = dto.quantity * dto.costPerUnit;
      newCost = newStock > 0 ? (totalExistingValue + incomingValue) / newStock : dto.costPerUnit;
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id },
        data: { currentStock: newStock, costPerUnit: newCost },
      }),
      this.prisma.stockTransaction.create({
        data: {
          inventoryItemId: id,
          outletId: item.outletId,
          type: 'StockIn',
          quantity: dto.quantity,
          costPerUnit: dto.costPerUnit ?? item.costPerUnit,
          referenceId: dto.referenceId,
          notes: dto.notes,
        },
      }),
    ]);

    this.eventsGateway.emitToRestaurant(item.outletId, 'inventory:updated', updated);
    return updated;
  }

  // ── Manual Adjust (Wastage / Spoilage / Correction) ─────────────────────

  async adjust(id: string, dto: StockAdjustDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');

    const newStock = Math.max(0, item.currentStock - dto.quantity);

    const [updated] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id },
        data: { currentStock: newStock },
      }),
      this.prisma.stockTransaction.create({
        data: {
          inventoryItemId: id,
          outletId: item.outletId,
          type: dto.type,
          quantity: dto.quantity,
          notes: dto.notes,
        },
      }),
    ]);

    this.eventsGateway.emitToRestaurant(item.outletId, 'inventory:updated', updated);
    return updated;
  }

  // ── Recipe-Driven Deduction (called by OrdersService) ───────────────────

  async deductForOrder(
    outletId: string,
    orderId: string,
    items: Array<{ itemId: string; quantity: number }>,
  ): Promise<void> {
    // Load all recipes for ordered menu items
    const recipes = await this.prisma.recipe.findMany({
      where: { menuItemId: { in: items.map((i) => i.itemId) } },
      include: { ingredients: { include: { inventoryItem: true } } },
    });

    // Build deduction map: inventoryItemId → total quantity needed
    const deductions = new Map<string, { needed: number; outletId: string }>();
    for (const orderItem of items) {
      const recipe = recipes.find((r) => r.menuItemId === orderItem.itemId);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const needed = ing.quantity * orderItem.quantity;
        const existing = deductions.get(ing.inventoryItemId)?.needed ?? 0;
        deductions.set(ing.inventoryItemId, { needed: existing + needed, outletId });
      }
    }

    if (deductions.size === 0) return;

    // Validate stock availability atomically
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: { id: { in: Array.from(deductions.keys()) }, outletId },
    });

    for (const item of inventoryItems) {
      const needed = deductions.get(item.id)!.needed;
      const available = item.currentStock - item.reservedStock;
      if (available < needed) {
        throw new BadRequestException(
          `Insufficient stock for "${item.name}": need ${needed}${item.unit}, available ${available}${item.unit}`,
        );
      }
    }

    // Atomically deduct all
    await this.prisma.$transaction(
      Array.from(deductions.entries()).flatMap(([invItemId, { needed }]) => [
        this.prisma.inventoryItem.update({
          where: { id: invItemId },
          data: { currentStock: { decrement: needed } },
        }),
        this.prisma.stockTransaction.create({
          data: {
            inventoryItemId: invItemId,
            outletId,
            type: 'StockOut',
            quantity: needed,
            referenceId: orderId,
            notes: `Auto-deducted for order ${orderId}`,
          },
        }),
      ]),
    );

    this.eventsGateway.emitToRestaurant(outletId, 'inventory:deducted', { orderId });
  }

  // ── Check availability for a set of menu items ──────────────────────────

  async checkAvailability(
    outletId: string,
    items: Array<{ itemId: string; quantity: number }>,
  ): Promise<{ available: boolean; unavailable: string[] }> {
    const recipes = await this.prisma.recipe.findMany({
      where: { menuItemId: { in: items.map((i) => i.itemId) } },
      include: { ingredients: { include: { inventoryItem: true } } },
    });

    const unavailable: string[] = [];

    for (const orderItem of items) {
      const recipe = recipes.find((r) => r.menuItemId === orderItem.itemId);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const needed = ing.quantity * orderItem.quantity;
        const avail = ing.inventoryItem.currentStock - ing.inventoryItem.reservedStock;
        if (avail < needed) {
          unavailable.push(ing.inventoryItem.name);
        }
      }
    }

    return { available: unavailable.length === 0, unavailable };
  }
}
