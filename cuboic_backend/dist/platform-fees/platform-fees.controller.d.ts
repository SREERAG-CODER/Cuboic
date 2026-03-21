import { PlatformFeesService } from './platform-fees.service';
export declare class PlatformFeesController {
    private readonly platformFeesService;
    constructor(platformFeesService: PlatformFeesService);
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<({
        order: {
            id: string;
            createdAt: Date;
            total: number;
        };
    } & {
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        isPaid: boolean;
        orderId: string;
    })[]>;
    getSummary(restaurantId: string): Promise<{
        totalOwed: number;
        totalPaid: number;
        unpaidCount: number;
    }>;
    markAsPaid(id: string): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        isPaid: boolean;
        orderId: string;
    }>;
}
