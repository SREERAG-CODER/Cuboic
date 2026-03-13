import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private prisma;
    private readonly eventsGateway;
    private readonly logger;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(dto: CreateOrderDto): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            method: string;
            transaction_id: string | null;
            orderId: string;
        } | null;
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__OrderClient<({
        table: {
            restaurantId: string;
            id: string;
            table_number: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(restaurantId: string, status?: string): import("@prisma/client").Prisma.PrismaPromise<({
        table: {
            restaurantId: string;
            id: string;
            table_number: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    })[]>;
    getSummary(restaurantId: string): Promise<{
        pending: number;
        preparing: number;
        completed: number;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    updateTable(id: string, tableId: string): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    cancelOrder(id: string): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    confirmDelivery(id: string): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    cleanupStaleOrders(): Promise<void>;
}
