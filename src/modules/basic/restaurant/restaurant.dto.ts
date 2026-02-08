import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

import { OperatorDto } from '~/common/dto/operator.dto';
import { PagerDto } from '~/common/dto/pager.dto';

export class RestaurantDto extends OperatorDto {
  @ApiProperty({ description: 'Restaurant Name' })
  @IsString()
  @MinLength(2, { message: 'Restaurant name length cannot be less than 2' })
  @MaxLength(150, { message: 'Restaurant name length cannot exceed 150' })
  name: string;

  @ApiProperty({ description: 'Restaurant Slug (public URL)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'Slug can only contain letters, numbers, and hyphens',
  })
  @MinLength(2, { message: 'Slug length cannot be less than 2' })
  @MaxLength(160, { message: 'Slug length cannot exceed 160' })
  slug: string;

  @ApiProperty({ description: 'Contact Email', required: false })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiProperty({ description: 'Phone', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(40, { message: 'Phone length cannot exceed 40' })
  phone?: string;

  @ApiProperty({ description: 'Logo', required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Owner User ID' })
  @IsInt()
  @Min(1)
  ownerId: number;
}

export class RestaurantUpdateDto extends PartialType(RestaurantDto) {}

export class RestaurantQueryDto extends IntersectionType(
  PagerDto<RestaurantDto>,
  PartialType(RestaurantDto),
) {
  @ApiProperty({ description: 'Restaurant Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Restaurant Slug', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'Is Active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
