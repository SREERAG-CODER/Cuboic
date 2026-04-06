import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRecipeDto } from './dto/upsert-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  /** Create or fully replace a recipe for a menu item */
  async upsert(dto: UpsertRecipeDto) {
    const menuItem = await this.prisma.menuItem.findUnique({ where: { id: dto.menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');

    return this.prisma.$transaction(async (tx) => {
      // Delete existing recipe if present
      const existing = await tx.recipe.findUnique({ where: { menuItemId: dto.menuItemId } });
      if (existing) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: existing.id } });
        await tx.recipe.delete({ where: { id: existing.id } });
      }

      // Create fresh recipe with ingredients
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

  async findByMenuItem(menuItemId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { menuItemId },
      include: { ingredients: { include: { inventoryItem: true } } },
    });
    if (!recipe) throw new NotFoundException('No recipe found for this menu item');
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

  async remove(menuItemId: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { menuItemId } });
    if (!recipe) throw new NotFoundException('Recipe not found');
    await this.prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id } });
    return this.prisma.recipe.delete({ where: { id: recipe.id } });
  }
}
