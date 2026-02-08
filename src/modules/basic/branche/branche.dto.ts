import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

import { OperatorDto } from '~/common/dto/operator.dto';
import { PagerDto } from '~/common/dto/pager.dto';

export class BrancheDto extends OperatorDto {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Branch Name' })
  @IsString()
  @MinLength(2, { message: 'Branch name length cannot be less than 2' })
  @MaxLength(120, { message: 'Branch name length cannot exceed 120' })
  name: string;

  @ApiProperty({ description: 'Branch Slug' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'Slug can only contain letters, numbers, and hyphens',
  })
  @MinLength(2, { message: 'Slug length cannot be less than 2' })
  @MaxLength(160, { message: 'Slug length cannot exceed 160' })
  slug: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Phone', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(40, { message: 'Phone length cannot exceed 40' })
  phone?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(64, { message: 'Timezone length cannot exceed 64' })
  timezone?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class BrancheUpdateDto extends PartialType(BrancheDto) {}

export class BrancheQueryDto extends IntersectionType(
  PagerDto<BrancheDto>,
  PartialType(BrancheDto),
) {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Branch Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Branch Slug', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
