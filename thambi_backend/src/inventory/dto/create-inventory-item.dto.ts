import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  outletId: string;

  @IsString()
  name: string;

  @IsString()
  unit: string; // kg, l, g, ml, pcs

  @IsOptional()
  @IsString()
  category?: string; // Vegetables, Meat, Dairy, DryGoods, General

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;
}
