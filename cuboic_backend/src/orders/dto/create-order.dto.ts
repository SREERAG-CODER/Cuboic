import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsString()
    @IsNotEmpty()
    itemId: string;

    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    restaurantId: string;

    @IsString()
    @IsNotEmpty()
    tableId: string;

    @IsString()
    @IsNotEmpty()
    customerSessionId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
