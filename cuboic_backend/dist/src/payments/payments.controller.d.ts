import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(restaurantId: string, from?: string, to?: string): import("@prisma/client").Prisma.PrismaPromise<({
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            outletId: string | null;
            status: import("@prisma/client").$Enums.OrderStatus;
            customer_session_id: string;
            orderType: string;
            items: import("@prisma/client/runtime/library").JsonValue;
            subtotal: number;
            tax: number;
            total: number;
            notes: string | null;
            tableId: string;
            customerId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        orderId: string;
        method: string;
        transaction_id: string | null;
    })[]>;
    getSummary(restaurantId: string): Promise<{
        order_count: number;
        total_revenue: number;
    }>;
}
