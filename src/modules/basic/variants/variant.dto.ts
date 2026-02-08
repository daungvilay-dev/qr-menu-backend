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

export class VariantDto extends OperatorDto {
  @ApiProperty({ description: 'Menu ID' })
  @IsInt()
  menuId: number;

  @ApiProperty({ description: 'Variant Name' })
  @IsString()
  @MinLength(1, { message: 'Variant name length cannot be less than 1' })
  @MaxLength(120, { message: 'Variant name length cannot exceed 120' })
  name: string;

  @ApiProperty({ description: 'Price Delta (cents)' })
  @IsInt()
  priceDeltaCents: number;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Sort Order', required: false })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class VariantUpdateDto extends PartialType(VariantDto) {}

export class VariantQueryDto extends IntersectionType(
  PagerDto<VariantDto>,
  PartialType(VariantDto),
) {
  @ApiProperty({ description: 'Menu ID', required: false })
  @IsInt()
  @IsOptional()
  menuId?: number;

  @ApiProperty({ description: 'Variant Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
