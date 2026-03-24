import { TablesService } from './tables.service';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    create(body: {
        restaurantId: string;
        table_number: string;
    }): import("@prisma/client").Prisma.Prisma__TableClient<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        table_number: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: {
        is_active: boolean;
    }): import("@prisma/client").Prisma.Prisma__TableClient<{
        id: string;
        is_active: boolean;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        table_number: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
