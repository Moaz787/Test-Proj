import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  OldPassword: string;

  @IsString()
  @IsNotEmpty()
  NewPassword: string;
}