import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AccountUpdateDto {
  @ApiProperty({ description: 'User Nickname' })
  @IsString()
  @IsOptional()
  nickname: string;

  @ApiProperty({ description: 'User mailbox' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User QQ' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  @MinLength(5)
  @MaxLength(11)
  qq: string;

  @ApiProperty({ description: 'User mobile phone number' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'User Avatar' })
  @IsOptional()
  @IsString()
  avatar: string;

  @ApiProperty({ description: 'remark' })
  @IsOptional()
  @IsString()
  remark: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Temporary token', example: 'uuid' })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: 'password', example: 'a123456' })
  @IsString()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i)
  @MinLength(6)
  password: string;
}
