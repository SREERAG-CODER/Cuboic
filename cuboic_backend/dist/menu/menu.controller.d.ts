import { MenuService } from './menu.service';
import { QueryMenuDto } from './dto/query-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    getMenu(query: QueryMenuDto): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/menu-item.schema").MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/menu-item.schema").MenuItem & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAdminMenu(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/menu-item.schema").MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/menu-item.schema").MenuItem & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createItem(dto: CreateMenuItemDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/menu-item.schema").MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/menu-item.schema").MenuItem & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateItem(id: string, dto: UpdateMenuItemDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/menu-item.schema").MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/menu-item.schema").MenuItem & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
