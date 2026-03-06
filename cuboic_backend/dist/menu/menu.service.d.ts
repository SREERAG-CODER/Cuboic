import { Types, Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { TableDocument } from '../tables/schemas/table.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuService {
    private menuItemModel;
    private tableModel;
    constructor(menuItemModel: Model<MenuItemDocument>, tableModel: Model<TableDocument>);
    getMenu(restaurantId: string, tableId?: string, categoryId?: string): Promise<(import("mongoose").Document<unknown, {}, MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & MenuItem & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getAllForAdmin(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & MenuItem & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    createItem(dto: CreateMenuItemDto): Promise<import("mongoose").Document<unknown, {}, MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & MenuItem & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateItem(id: string, dto: UpdateMenuItemDto): Promise<import("mongoose").Document<unknown, {}, MenuItemDocument, {}, import("mongoose").DefaultSchemaOptions> & MenuItem & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
