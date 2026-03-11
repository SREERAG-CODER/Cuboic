import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        restaurantId: string;
        name: string;
        display_order: number;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
