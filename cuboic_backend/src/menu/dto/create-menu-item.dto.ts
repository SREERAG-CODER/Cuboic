import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateMenuItemDto {
    @IsString()
    restaurantId: string;

    @IsString()
    categoryId: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

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
