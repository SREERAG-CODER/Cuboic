import { PrismaService } from '../prisma/prisma.service';
export declare class PlatformFeesService {
    private prisma;
    constructor(prisma: PrismaService);
    createIfEligible(restaurantId: string, orderId: string, orderTotal: number): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        isPaid: boolean;
        orderId: string;
    } | null>;
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
    markAsPaid(feeId: string): Promise<{
        restaurantId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        isPaid: boolean;
        orderId: string;
    }>;
}
