import { IsString, IsOptional } from 'class-validator';

export class QueryMenuDto {
    @IsString()
    restaurantId: string;

    @IsOptional()
    @IsString()
    tableId?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;
}
