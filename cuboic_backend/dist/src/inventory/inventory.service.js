"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events/events.gateway");
let InventoryService = class InventoryService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    create(dto) {
        return this.prisma.inventoryItem.create({ data: dto });
    }
    findAll(outletId) {
        return this.prisma.inventoryItem.findMany({
            where: { outletId },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }
    async findLowStock(outletId) {
        const items = await this.prisma.inventoryItem.findMany({ where: { outletId } });
        return items.filter((i) => i.currentStock <= i.reorderLevel);
    }
    async findOne(id) {
        const item = await this.prisma.inventoryItem.findUnique({
            where: { id },
            include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
        });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        return item;
    }
    async update(id, data) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        return this.prisma.inventoryItem.update({ where: { id }, data });
    }
    async remove(id) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        return this.prisma.inventoryItem.delete({ where: { id } });
    }
    async stockIn(id, dto) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
        const newStock = item.currentStock + dto.quantity;
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
    async adjust(id, dto) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Inventory item not found');
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
    async deductForOrder(outletId, orderId, items) {
        const recipes = await this.prisma.recipe.findMany({
            where: { menuItemId: { in: items.map((i) => i.itemId) } },
            include: { ingredients: { include: { inventoryItem: true } } },
        });
        const deductions = new Map();
        for (const orderItem of items) {
            const recipe = recipes.find((r) => r.menuItemId === orderItem.itemId);
            if (!recipe)
                continue;
            for (const ing of recipe.ingredients) {
                const needed = ing.quantity * orderItem.quantity;
                const existing = deductions.get(ing.inventoryItemId)?.needed ?? 0;
                deductions.set(ing.inventoryItemId, { needed: existing + needed, outletId });
            }
        }
        if (deductions.size === 0)
            return;
        const inventoryItems = await this.prisma.inventoryItem.findMany({
            where: { id: { in: Array.from(deductions.keys()) }, outletId },
        });
        for (const item of inventoryItems) {
            const needed = deductions.get(item.id).needed;
            const available = item.currentStock - item.reservedStock;
            if (available < needed) {
                throw new common_1.BadRequestException(`Insufficient stock for "${item.name}": need ${needed}${item.unit}, available ${available}${item.unit}`);
            }
        }
        await this.prisma.$transaction(Array.from(deductions.entries()).flatMap(([invItemId, { needed }]) => [
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
        ]));
        this.eventsGateway.emitToRestaurant(outletId, 'inventory:deducted', { orderId });
    }
    async checkAvailability(outletId, items) {
        const recipes = await this.prisma.recipe.findMany({
            where: { menuItemId: { in: items.map((i) => i.itemId) } },
            include: { ingredients: { include: { inventoryItem: true } } },
        });
        const unavailable = [];
        for (const orderItem of items) {
            const recipe = recipes.find((r) => r.menuItemId === orderItem.itemId);
            if (!recipe)
                continue;
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map