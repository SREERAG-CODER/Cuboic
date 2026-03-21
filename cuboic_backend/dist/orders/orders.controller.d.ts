import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<{
        table: {
            restaurantId: string;
            id: string;
            table_number: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        customer: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
        } | null;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            orderId: string;
            method: string;
            transaction_id: string | null;
        } | null;
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        customerId: string | null;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    getSummary(restaurantId: string): Promise<{
        pending: number;
        preparing: number;
        completed: number;
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
        customer: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
        } | null;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            orderId: string;
            method: string;
            transaction_id: string | null;
        } | null;
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        customerId: string | null;
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
        customer: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
        } | null;
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            orderId: string;
            method: string;
            transaction_id: string | null;
        } | null;
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        customerId: string | null;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    })[]>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        customerId: string | null;
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
        customerId: string | null;
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
        customerId: string | null;
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
        customerId: string | null;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
    markAsPaid(id: string): Promise<{
        table: {
            restaurantId: string;
            id: string;
            table_number: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            orderId: string;
            method: string;
            transaction_id: string | null;
        } | null;
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
        customerId: string | null;
        notes: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
}
