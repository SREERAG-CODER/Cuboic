import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private prisma;
    private readonly eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    create(dto: CreateOrderDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
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
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
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
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
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
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
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
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        customer_session_id: string;
        items: import("@prisma/client/runtime/library").JsonValue;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: number;
        tax: number;
        total: number;
        tableId: string;
    }>;
}
