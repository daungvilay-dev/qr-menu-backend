import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class PasswordUpdateDto {
  @ApiProperty({ description: 'Old Password' })
  @IsString()
  @Matches(/^[\s\S]+$/)
  @MinLength(6)
  @MaxLength(20)
  oldPassword: string;

  @ApiProperty({ description: 'New Password' })
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message:
      'Password must contain numbers, letters, and be 6-16 characters long',
  })
  newPassword: string;
}

export class UserPasswordDto {
  @ApiProperty({ description: 'Admin/User ID' })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Updated Password' })
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: 'Password format is incorrect',
  })
  password: string;
}

export class UserExistDto {
  @ApiProperty({ description: 'Login Username' })
  @IsString()
  @Matches(/^[\w-]{4,16}$/)
  @MinLength(6)
  @MaxLength(20)
  username: string;
}
