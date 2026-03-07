import { PrismaService } from '../prisma/prisma.service';
export declare class RestaurantsService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): import("@prisma/client").Prisma.Prisma__RestaurantClient<{
        name: string;
        description: string | null;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        logo_url: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        description: string | null;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        logo_url: string | null;
    }[]>;
    create(data: {
        name: string;
        description?: string;
        logoUrl?: string;
    }): import("@prisma/client").Prisma.Prisma__RestaurantClient<{
        name: string;
        description: string | null;
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        logo_url: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
