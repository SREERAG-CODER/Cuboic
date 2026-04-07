export declare class RecipeIngredientDto {
    inventoryItemId: string;
    quantity: number;
}
export declare class UpsertRecipeDto {
    menuItemId: string;
    instructions?: string;
    ingredients: RecipeIngredientDto[];
}
