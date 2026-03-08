import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateSellerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  brandName: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  brandDescription: string;
}
