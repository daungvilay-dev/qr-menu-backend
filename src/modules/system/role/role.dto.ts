import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { OperatorDto } from '~/common/dto/operator.dto';
import { PagerDto } from '~/common/dto/pager.dto';

import { RoleEntity } from './role.entity';

export class RoleDto extends OperatorDto {
  @ApiProperty({ description: 'Role Name' })
  @IsString()
  @MinLength(2, { message: 'Role name length cannot be less than 2' })
  name: string;

  @ApiProperty({ description: 'Role Identifier' })
  @IsString()
  @Matches(/^[a-z0-9]+$/i, {
    message: 'Role value can only contain letters and numbers',
  })
  @MinLength(2, { message: 'Role value length cannot be less than 2' })
  value: string;

  @ApiProperty({ description: 'Role Remark' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ description: 'Status' })
  @IsIn([0, 1])
  status: number;

  @ApiProperty({ description: 'Associated Menu, Permission IDs' })
  @IsOptional()
  @IsArray()
  menuIds?: number[];
}

export class RoleUpdateDto extends PartialType(RoleDto) {}

export class RoleQueryDto extends IntersectionType(
  PagerDto<RoleDto>,
  PartialType(RoleDto),
) {
  @ApiProperty({ description: 'Role Name', required: false })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Role Value', required: false })
  @IsString()
  value: string;
}
