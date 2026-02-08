import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

import { OperatorDto } from '~/common/dto/operator.dto';
import { PagerDto } from '~/common/dto/pager.dto';

export class QrcodeDto extends OperatorDto {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Branch ID', required: false })
  @IsInt()
  @IsOptional()
  branchId?: number;

  @ApiProperty({ description: 'Table Number', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(40, { message: 'Table number length cannot exceed 40' })
  tableNumber?: string;

  @ApiProperty({
    description: 'Table Number (snake_case alias)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(40, { message: 'Table number length cannot exceed 40' })
  table_number?: string;
}

export class QrcodeUpdateDto extends PartialType(QrcodeDto) {}

export class QrcodeQueryDto extends IntersectionType(
  PagerDto<QrcodeDto>,
  PartialType(QrcodeDto),
) {
  @ApiProperty({ description: 'Restaurant ID', required: false })
  @IsInt()
  @IsOptional()
  restaurantId?: number;

  @ApiProperty({ description: 'Branch ID', required: false })
  @IsInt()
  @IsOptional()
  branchId?: number;
}
