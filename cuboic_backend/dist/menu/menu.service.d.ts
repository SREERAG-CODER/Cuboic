import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    getMenu(restaurantId: string, tableId?: string, categoryId?: string): Promise<{
        restaurantId: string;
        categoryId: string;
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAllForAdmin(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        restaurantId: string;
        categoryId: string;
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createItem(dto: CreateMenuItemDto): import("@prisma/client").Prisma.Prisma__MenuItemClient<{
        restaurantId: string;
        categoryId: string;
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateItem(id: string, dto: UpdateMenuItemDto): Promise<{
        restaurantId: string;
        categoryId: string;
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteItem(id: string): Promise<{
        restaurantId: string;
        categoryId: string;
        name: string;
        description: string | null;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
