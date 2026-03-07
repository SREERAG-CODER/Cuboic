import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<{
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        customer_session_id: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        total: number;
        tableId: string;
    }>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__OrderClient<{
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        customer_session_id: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        total: number;
        tableId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(restaurantId: string, status?: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        customer_session_id: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        total: number;
        tableId: string;
    }[]>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        customer_session_id: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        total: number;
        tableId: string;
    }>;
    confirmDelivery(id: string): Promise<{
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        customer_session_id: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        total: number;
        tableId: string;
    }>;
}
