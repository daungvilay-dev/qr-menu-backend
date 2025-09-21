import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  password: string;

  @IsNumber()
  @Max(3)
  code: number;
}
