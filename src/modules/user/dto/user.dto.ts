import { Type } from 'class-transformer';
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

import { PagerDto } from '../../../common/dto/pager.dto';

export class UserDto {
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsString()
  @Matches(/^[\s\S]+$/)
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsOptional()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: 'Password must contain numbers and letters, length 6-16',
  })
  password: string;

  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  roleIds: number[];

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  deptId?: number;

  @IsOptional()
  @IsString()
  nickname: string;

  @IsEmail()
  @ValidateIf((o) => !isEmpty(o.email))
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{4,10}$/)
  @MinLength(5)
  @MaxLength(11)
  qq?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsIn([0, 1])
  status: number;
}

export class UserUpdateDto extends UserDto {}
