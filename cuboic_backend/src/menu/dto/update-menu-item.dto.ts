import { IsString, IsNumber, IsBoolean, IsOptional, IsMongoId, Min } from 'class-validator';

export class UpdateMenuItemDto {
    @IsOptional()
    @IsMongoId()
    categoryId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsString()
    image_url?: string;

    @IsOptional()
    @IsBoolean()
    is_available?: boolean;

    @IsOptional()
    @IsNumber()
    display_order?: number;
}
