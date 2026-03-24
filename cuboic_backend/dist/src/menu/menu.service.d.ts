import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    getMenu(restaurantId: string, tableId?: string, categoryId?: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        display_order: number;
        categoryId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
    }[]>;
    getAllForAdmin(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        display_order: number;
        categoryId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
    }[]>;
    createItem(dto: CreateMenuItemDto): import("@prisma/client").Prisma.Prisma__MenuItemClient<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        display_order: number;
        categoryId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateItem(id: string, dto: UpdateMenuItemDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        display_order: number;
        categoryId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
    }>;
    deleteItem(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        display_order: number;
        categoryId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
    }>;
}
