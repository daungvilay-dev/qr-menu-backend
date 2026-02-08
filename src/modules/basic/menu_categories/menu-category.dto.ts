import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { OperatorDto } from '~/common/dto/operator.dto';
import { PagerDto } from '~/common/dto/pager.dto';

export class MenuCategoryDto extends OperatorDto {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Branch ID', required: false })
  @IsInt()
  @IsOptional()
  branchId?: number;

  @ApiProperty({ description: 'Category Name' })
  @IsString()
  @MinLength(2, { message: 'Category name length cannot be less than 2' })
  @MaxLength(120, { message: 'Category name length cannot exceed 120' })
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Sort Order', required: false })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class MenuCategoryUpdateDto extends PartialType(MenuCategoryDto) {}

export class MenuCategoryQueryDto extends IntersectionType(
  PagerDto<MenuCategoryDto>,
  PartialType(MenuCategoryDto),
) {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Branch ID', required: false })
  @IsInt()
  @IsOptional()
  branchId?: number;

  @ApiProperty({ description: 'Category Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
