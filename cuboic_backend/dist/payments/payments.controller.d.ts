import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(restaurantId: string, from?: string, to?: string): import("@prisma/client").Prisma.PrismaPromise<({
        order: {
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
