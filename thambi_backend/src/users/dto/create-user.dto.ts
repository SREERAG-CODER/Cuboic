import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsIn(['Admin', 'Owner', 'Manager', 'Cashier', 'Waiter', 'Kitchen', 'Staff'])
    role: string;

    @IsOptional()
    @IsString()
    restaurantId?: string;

    @IsOptional()
    dashboard_config?: any;
}
