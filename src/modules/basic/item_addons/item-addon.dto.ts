import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

import { OperatorDto } from '~/common/dto/operator.dto';
import { PagerDto } from '~/common/dto/pager.dto';

export class ItemAddonDto extends OperatorDto {
  @ApiProperty({ description: 'Menu Item ID' })
  @IsInt()
  menuId: number;

  @ApiProperty({ description: 'Addon ID' })
  @IsInt()
  addonId: number;
}

export class ItemAddonUpdateDto extends PartialType(ItemAddonDto) {}

export class ItemAddonQueryDto extends IntersectionType(
  PagerDto<ItemAddonDto>,
  PartialType(ItemAddonDto),
) {
  @ApiProperty({ description: 'Menu Item ID', required: false })
  @IsInt()
  @IsOptional()
  menuId?: number;

  @ApiProperty({ description: 'Addon ID', required: false })
  @IsInt()
  @IsOptional()
  addonId?: number;
}
