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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MenuService = class MenuService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMenu(restaurantId, tableId, categoryId) {
        if (tableId) {
            const table = await this.prisma.table.findFirst({
                where: { id: tableId, restaurantId, is_active: true },
            });
            if (!table)
                throw new common_1.NotFoundException('Table not found or inactive');
        }
        return this.prisma.menuItem.findMany({
            where: {
                restaurantId,
                is_available: true,
                ...(categoryId ? { categoryId } : {}),
            },
            orderBy: { display_order: 'asc' },
        });
    }
    getAllForAdmin(restaurantId) {
        return this.prisma.menuItem.findMany({
            where: { restaurantId },
            orderBy: [{ display_order: 'asc' }, { name: 'asc' }],
        });
    }
    createItem(dto) {
        return this.prisma.menuItem.create({
            data: {
                restaurantId: dto.restaurantId,
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                image_url: dto.image_url,
                is_available: dto.is_available ?? true,
                display_order: dto.display_order ?? 0,
            },
        });
    }
    async updateItem(id, dto) {
        const updated = await this.prisma.menuItem.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
                ...(dto.image_url !== undefined && { image_url: dto.image_url }),
                ...(dto.is_available !== undefined && { is_available: dto.is_available }),
                ...(dto.display_order !== undefined && { display_order: dto.display_order }),
            },
        }).catch(() => { throw new common_1.NotFoundException('Menu item not found'); });
        return updated;
    }
    deleteItem(id) {
        return this.prisma.menuItem.delete({ where: { id } })
            .catch(() => { throw new common_1.NotFoundException('Menu item not found'); });
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenuService);
//# sourceMappingURL=menu.service.js.map