import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, Model } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { Table, TableDocument } from '../tables/schemas/table.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
    constructor(
        @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
        @InjectModel(Table.name) private tableModel: Model<TableDocument>,
    ) { }

    async getMenu(restaurantId: string, tableId?: string, categoryId?: string) {
        if (!Types.ObjectId.isValid(restaurantId)) {
            throw new BadRequestException(`Invalid restaurant ID: "${restaurantId}"`);
        }

        if (tableId) {
            if (!Types.ObjectId.isValid(tableId)) {
                throw new BadRequestException(`Invalid table ID: "${tableId}"`);
            }

            const table = await this.tableModel.findOne({
                _id: new Types.ObjectId(tableId),
                restaurant_id: new Types.ObjectId(restaurantId),
                is_active: true,
            });
            if (!table) throw new NotFoundException('Table not found or inactive');
        }

        const filter: Record<string, any> = {
            restaurant_id: new Types.ObjectId(restaurantId),
            is_available: true,
        };

        if (categoryId) {
            if (!Types.ObjectId.isValid(categoryId)) {
                throw new BadRequestException(`Invalid category ID: "${categoryId}"`);
            }
            filter.category_id = new Types.ObjectId(categoryId);
        }

        return this.menuItemModel.find(filter).sort({ display_order: 1 });
    }

    // ── Admin-only methods ──────────────────────────────────

    async getAllForAdmin(restaurantId: string) {
        if (!Types.ObjectId.isValid(restaurantId)) {
            throw new BadRequestException(`Invalid restaurant ID: "${restaurantId}"`);
        }
        return this.menuItemModel
            .find({ restaurant_id: new Types.ObjectId(restaurantId) })
            .sort({ display_order: 1, name: 1 });
    }

    async createItem(dto: CreateMenuItemDto) {
        if (!Types.ObjectId.isValid(dto.restaurant_id)) {
            throw new BadRequestException('Invalid restaurant_id');
        }
        if (!Types.ObjectId.isValid(dto.category_id)) {
            throw new BadRequestException('Invalid category_id');
        }
        const item = new this.menuItemModel({
            ...dto,
            restaurant_id: new Types.ObjectId(dto.restaurant_id),
            category_id: new Types.ObjectId(dto.category_id),
        });
        return item.save();
    }

    async updateItem(id: string, dto: UpdateMenuItemDto) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid item ID');
        }
        const update: Record<string, any> = { ...dto };
        if (dto.category_id) {
            if (!Types.ObjectId.isValid(dto.category_id)) {
                throw new BadRequestException('Invalid category_id');
            }
            update.category_id = new Types.ObjectId(dto.category_id);
        }
        const updated = await this.menuItemModel.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true },
        );
        if (!updated) throw new NotFoundException('Menu item not found');
        return updated;
    }
}