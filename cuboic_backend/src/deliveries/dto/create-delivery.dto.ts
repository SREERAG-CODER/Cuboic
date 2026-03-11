import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class DeliveryStopDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    tableId: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    cabinets: string[];

    @IsInt()
    @Min(1)
    sequence: number;
}

export class CreateDeliveryDto {
    @IsString()
    @IsNotEmpty()
    restaurantId: string;

    @IsString()
    @IsNotEmpty()
    robotId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeliveryStopDto)
    @ArrayMinSize(1)
    stops: DeliveryStopDto[];
}
