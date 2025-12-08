import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PagerDto } from '~/common/dto/pager.dto';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { isEmpty } from 'lodash';
export class UserDto {
  @ApiProperty({ description: 'Login account', example: 'admin' })
  @IsString()
  @Matches(/^[\s\S]+$/)
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: 'Login password', example: 'a123456' })
  @IsOptional()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: 'Password must contain numbers and letters, length 6-16',
  })
  password: string;

  @ApiProperty({ description: 'Role IDs', type: [Number] })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  roleIds: number[];

  @ApiProperty({ description: 'Nickname', example: 'admin' })
  @IsOptional()
  @IsString()
  nickname: string;

  @ApiProperty({ description: 'Email', example: 'bqy.dev@qq.com' })
  @IsEmail()
  @ValidateIf((o) => !isEmpty(o.email))
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Remark' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: 'Status' })
  @IsIn([0, 1])
  status: number;
}

export class UserUpdateDto extends PartialType(UserDto) {}

export class UserQueryDto extends IntersectionType(
  PagerDto<UserDto>,
  PartialType(UserDto),
) {
  @ApiProperty({ description: 'Status', example: 0, required: false })
  @IsInt()
  @IsOptional()
  status?: number;
}
