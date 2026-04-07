import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
    @IsString()
    @IsIn(['Confirmed', 'Preparing', 'Ready', 'Assigned', 'Delivered', 'Cancelled'])
    status: string;
}
