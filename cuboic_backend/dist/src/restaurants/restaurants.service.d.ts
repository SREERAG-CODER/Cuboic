import { PrismaService } from '../prisma/prisma.service';
export declare class RestaurantsService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): import("@prisma/client").Prisma.Prisma__RestaurantClient<({
        tables: {
            id: string;
            is_active: boolean;
            createdAt: Date;
            updatedAt: Date;
            restaurantId: string;
            table_number: string;
        }[];
    } & {
        id: string;
        name: string;
        description: string | null;
        logo_url: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findTables(restaurantId: string): Promise<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        table_number: string;
    }[]>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        description: string | null;
        logo_url: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(data: {
        name: string;
        description?: string;
        logoUrl?: string;
    }): import("@prisma/client").Prisma.Prisma__RestaurantClient<{
        id: string;
        name: string;
        description: string | null;
        logo_url: string | null;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
