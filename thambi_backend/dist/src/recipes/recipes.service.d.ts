import { PrismaService } from '../prisma/prisma.service';
import { UpsertRecipeDto } from './dto/upsert-recipe.dto';
export declare class RecipesService {
    private prisma;
    constructor(prisma: PrismaService);
    upsert(dto: UpsertRecipeDto): Promise<{
        ingredients: ({
            inventoryItem: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                category: string;
                outletId: string;
                unit: string;
                currentStock: number;
                costPerUnit: number;
                reorderLevel: number;
                reservedStock: number;
            };
        } & {
            id: string;
            quantity: number;
            inventoryItemId: string;
            recipeId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        menuItemId: string;
        instructions: string | null;
    }>;
    findByMenuItem(menuItemId: string): Promise<{
        ingredients: ({
            inventoryItem: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                category: string;
                outletId: string;
                unit: string;
                currentStock: number;
                costPerUnit: number;
                reorderLevel: number;
                reservedStock: number;
            };
        } & {
            id: string;
            quantity: number;
            inventoryItemId: string;
            recipeId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        menuItemId: string;
        instructions: string | null;
    }>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        menuItem: {
            id: string;
            name: string;
            price: number;
        };
        ingredients: ({
            inventoryItem: {
                id: string;
                name: string;
                unit: string;
            };
        } & {
            id: string;
            quantity: number;
            inventoryItemId: string;
            recipeId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        menuItemId: string;
        instructions: string | null;
    })[]>;
    remove(menuItemId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        menuItemId: string;
        instructions: string | null;
    }>;
}
