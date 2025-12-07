import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ minLength: 3, maxLength: 10 })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  password: string;

  @ApiProperty({ maximum: 3, example: 1 })
  @IsNumber()
  @Max(3)
  code: number;
}

export class TagQueryDto extends IntersectionType(
  CreateDepartmentDto,
  PartialType(CreateDepartmentDto),
) {}
