import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    getMenu(restaurantId: string, tableId?: string, categoryId?: string): Promise<{
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }[]>;
    getAllForAdmin(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }[]>;
    createItem(dto: CreateMenuItemDto): import("@prisma/client").Prisma.Prisma__MenuItemClient<{
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateItem(id: string, dto: UpdateMenuItemDto): Promise<{
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }>;
    deleteItem(id: string): Promise<{
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        restaurantId: string;
        createdAt: Date;
        updatedAt: Date;
        categoryId: string;
    }>;
}
