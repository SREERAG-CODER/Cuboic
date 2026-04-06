import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { StockInDto, StockAdjustDto } from './dto/stock-operations.dto';
export declare class InventoryService {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(dto: CreateInventoryItemDto): import("@prisma/client").Prisma.Prisma__InventoryItemClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(outletId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }[]>;
    findLowStock(outletId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }[]>;
    findOne(id: string): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            outletId: string;
            notes: string | null;
            quantity: number;
            costPerUnit: number | null;
            referenceId: string | null;
            type: import("@prisma/client").$Enums.StockTransactionType;
            inventoryItemId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }>;
    update(id: string, data: Partial<CreateInventoryItemDto>): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }>;
    stockIn(id: string, dto: StockInDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }>;
    adjust(id: string, dto: StockAdjustDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        outletId: string;
        unit: string;
        currentStock: number;
        costPerUnit: number;
        reorderLevel: number;
        reservedStock: number;
    }>;
    deductForOrder(outletId: string, orderId: string, items: Array<{
        itemId: string;
        quantity: number;
    }>): Promise<void>;
    checkAvailability(outletId: string, items: Array<{
        itemId: string;
        quantity: number;
    }>): Promise<{
        available: boolean;
        unavailable: string[];
    }>;
}
