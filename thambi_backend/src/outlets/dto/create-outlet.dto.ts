import { IsString, IsOptional } from 'class-validator';

export class CreateOutletDto {
  @IsString()
  restaurantId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;
}
