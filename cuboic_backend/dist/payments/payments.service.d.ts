import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(restaurantId: string, from?: string, to?: string): import("@prisma/client").Prisma.PrismaPromise<({
        order: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        method: string;
        transaction_id: string | null;
    })[]>;
    getSummary(restaurantId: string): Promise<{
        order_count: number;
        total_revenue: number;
    }>;
}
