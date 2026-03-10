import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableId: string;
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
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        customer_session_id: string;
        subtotal: number;
        tax: number;
        total: number;
    }>;
}
