import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min, IsOptional } from 'class-validator';
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
    @IsOptional()
    outletId?: string;

    @IsString()
    @IsNotEmpty()
    tableId: string;

    @IsString()
    @IsNotEmpty()
    customerSessionId: string;

    @IsString()
    @IsOptional()
    customerId?: string;

    @IsString()
    @IsOptional()
    orderType?: string; // DineIn | Takeaway | Delivery

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
