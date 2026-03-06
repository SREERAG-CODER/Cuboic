"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const menu_item_schema_1 = require("./schemas/menu-item.schema");
const table_schema_1 = require("../tables/schemas/table.schema");
let MenuService = class MenuService {
    menuItemModel;
    tableModel;
    constructor(menuItemModel, tableModel) {
        this.menuItemModel = menuItemModel;
        this.tableModel = tableModel;
    }
    async getMenu(restaurantId, tableId, categoryId) {
        if (!mongoose_2.Types.ObjectId.isValid(restaurantId)) {
            throw new common_1.BadRequestException(`Invalid restaurant ID: "${restaurantId}"`);
        }
        if (tableId) {
            if (!mongoose_2.Types.ObjectId.isValid(tableId)) {
                throw new common_1.BadRequestException(`Invalid table ID: "${tableId}"`);
            }
            const table = await this.tableModel.findOne({
                _id: new mongoose_2.Types.ObjectId(tableId),
                restaurant_id: new mongoose_2.Types.ObjectId(restaurantId),
                is_active: true,
            });
            if (!table)
                throw new common_1.NotFoundException('Table not found or inactive');
        }
        const filter = {
            restaurant_id: new mongoose_2.Types.ObjectId(restaurantId),
            is_available: true,
        };
        if (categoryId) {
            if (!mongoose_2.Types.ObjectId.isValid(categoryId)) {
                throw new common_1.BadRequestException(`Invalid category ID: "${categoryId}"`);
            }
            filter.category_id = new mongoose_2.Types.ObjectId(categoryId);
        }
        return this.menuItemModel.find(filter).sort({ display_order: 1 });
    }
    async getAllForAdmin(restaurantId) {
        if (!mongoose_2.Types.ObjectId.isValid(restaurantId)) {
            throw new common_1.BadRequestException(`Invalid restaurant ID: "${restaurantId}"`);
        }
        return this.menuItemModel
            .find({ restaurant_id: new mongoose_2.Types.ObjectId(restaurantId) })
            .sort({ display_order: 1, name: 1 });
    }
    async createItem(dto) {
        if (!mongoose_2.Types.ObjectId.isValid(dto.restaurant_id)) {
            throw new common_1.BadRequestException('Invalid restaurant_id');
        }
        if (!mongoose_2.Types.ObjectId.isValid(dto.category_id)) {
            throw new common_1.BadRequestException('Invalid category_id');
        }
        const item = new this.menuItemModel({
            ...dto,
            restaurant_id: new mongoose_2.Types.ObjectId(dto.restaurant_id),
            category_id: new mongoose_2.Types.ObjectId(dto.category_id),
        });
        return item.save();
    }
    async updateItem(id, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid item ID');
        }
        const update = { ...dto };
        if (dto.category_id) {
            if (!mongoose_2.Types.ObjectId.isValid(dto.category_id)) {
                throw new common_1.BadRequestException('Invalid category_id');
            }
            update.category_id = new mongoose_2.Types.ObjectId(dto.category_id);
        }
        const updated = await this.menuItemModel.findByIdAndUpdate(id, { $set: update }, { new: true });
        if (!updated)
            throw new common_1.NotFoundException('Menu item not found');
        return updated;
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(menu_item_schema_1.MenuItem.name)),
    __param(1, (0, mongoose_1.InjectModel)(table_schema_1.Table.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], MenuService);
//# sourceMappingURL=menu.service.js.map