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

export class AddonDto extends OperatorDto {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Addon Name' })
  @IsString()
  @MinLength(2, { message: 'Addon name length cannot be less than 2' })
  @MaxLength(120, { message: 'Addon name length cannot exceed 120' })
  name: string;

  @ApiProperty({ description: 'Price (minor units)' })
  @IsInt()
  price: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Sort Order', required: false })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class AddonUpdateDto extends PartialType(AddonDto) {}

export class AddonQueryDto extends IntersectionType(
  PagerDto<AddonDto>,
  PartialType(AddonDto),
) {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Addon Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
