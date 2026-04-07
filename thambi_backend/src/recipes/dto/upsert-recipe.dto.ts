import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeIngredientDto {
  @IsString()
  inventoryItemId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number; // per 1 unit of menu item
}

export class UpsertRecipeDto {
  @IsString()
  menuItemId: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];
}
