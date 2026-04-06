import { IsNumber, IsString, IsOptional, Min, IsIn } from 'class-validator';

export class StockInDto {
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @IsOptional()
  @IsString()
  referenceId?: string; // supplier ref

  @IsOptional()
  @IsString()
  notes?: string;
}

export class StockAdjustDto {
  @IsIn(['Wastage', 'Spoilage', 'Correction'])
  type: 'Wastage' | 'Spoilage' | 'Correction';

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
