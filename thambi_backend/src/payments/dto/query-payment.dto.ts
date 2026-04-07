import { IsOptional, IsString } from 'class-validator';

export class QueryPaymentDto {
    @IsString()
    restaurantId: string;

    @IsOptional()
    @IsString()
    from?: string;

    @IsOptional()
    @IsString()
    to?: string;
}
