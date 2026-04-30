import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { OperatorDto } from '~/common/dto/operator.dto';
import { PagerDto } from '~/common/dto/pager.dto';

const toOptionalInt = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'number' ? value : Number.parseInt(String(value), 10);
};

const toOptionalBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
};

export class MenuDto extends OperatorDto {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @Transform(toOptionalInt)
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Category ID' })
  @Transform(toOptionalInt)
  @IsInt()
  categoryId: number;

  @ApiProperty({ description: 'Menu Name' })
  @IsString()
  @MinLength(2, { message: 'Menu name length cannot be less than 2' })
  @MaxLength(150, { message: 'Menu name length cannot exceed 150' })
  name: string;

  @ApiProperty({ description: 'Image', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(150, { message: 'Image length cannot exceed 150' })
  img?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price (minor units)' })
  @Transform(toOptionalInt)
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Is Available', required: false })
  @Transform(toOptionalBoolean)
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Spicy Level (0-3)', required: false })
  @Transform(toOptionalInt)
  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  spicyLevel?: number;

  @ApiProperty({ description: 'Is Vegetarian', required: false })
  @Transform(toOptionalBoolean)
  @IsBoolean()
  @IsOptional()
  isVeg?: boolean;

  @ApiProperty({ description: 'Sort Order', required: false })
  @Transform(toOptionalInt)
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class MenuUpdateDto extends PartialType(MenuDto) {}

export class MenuQueryDto extends IntersectionType(
  PagerDto<MenuDto>,
  PartialType(MenuDto),
) {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ description: 'Menu Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Is Available', required: false })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
