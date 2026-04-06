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
exports.RecipesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecipesService = class RecipesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(dto) {
        const menuItem = await this.prisma.menuItem.findUnique({ where: { id: dto.menuItemId } });
        if (!menuItem)
            throw new common_1.NotFoundException('Menu item not found');
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.recipe.findUnique({ where: { menuItemId: dto.menuItemId } });
            if (existing) {
                await tx.recipeIngredient.deleteMany({ where: { recipeId: existing.id } });
                await tx.recipe.delete({ where: { id: existing.id } });
            }
            return tx.recipe.create({
                data: {
                    menuItemId: dto.menuItemId,
                    instructions: dto.instructions,
                    ingredients: {
                        create: dto.ingredients.map((ing) => ({
                            inventoryItemId: ing.inventoryItemId,
                            quantity: ing.quantity,
                        })),
                    },
                },
                include: {
                    ingredients: { include: { inventoryItem: true } },
                },
            });
        });
    }
    async findByMenuItem(menuItemId) {
        const recipe = await this.prisma.recipe.findUnique({
            where: { menuItemId },
            include: { ingredients: { include: { inventoryItem: true } } },
        });
        if (!recipe)
            throw new common_1.NotFoundException('No recipe found for this menu item');
        return recipe;
    }
    findAll() {
        return this.prisma.recipe.findMany({
            include: {
                menuItem: { select: { id: true, name: true, price: true } },
                ingredients: { include: { inventoryItem: { select: { id: true, name: true, unit: true } } } },
            },
        });
    }
    async remove(menuItemId) {
        const recipe = await this.prisma.recipe.findUnique({ where: { menuItemId } });
        if (!recipe)
            throw new common_1.NotFoundException('Recipe not found');
        await this.prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
        return this.prisma.recipe.delete({ where: { id: recipe.id } });
    }
};
exports.RecipesService = RecipesService;
exports.RecipesService = RecipesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecipesService);
//# sourceMappingURL=recipes.service.js.map