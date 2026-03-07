import { MenuService } from './menu.service';
import { QueryMenuDto } from './dto/query-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    getMenu(query: QueryMenuDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        categoryId: string;
    }[]>;
    getAdminMenu(restaurantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        categoryId: string;
    }[]>;
    createItem(dto: CreateMenuItemDto): import("@prisma/client").Prisma.Prisma__MenuItemClient<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        categoryId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateItem(id: string, dto: UpdateMenuItemDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        restaurantId: string;
        price: number;
        image_url: string | null;
        is_available: boolean;
        display_order: number;
        categoryId: string;
    }>;
}
