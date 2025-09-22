import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class PasswordUpdateDto {
  @IsString()
  @Matches(/^[\s\S]+$/)
  @MinLength(6)
  @MaxLength(20)
  oldPassword: string;

  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message:
      'Password must contain numbers, letters, and be 6-16 characters long',
  })
  newPassword: string;
}

export class UserPasswordDto {
  // @ApiProperty({ description: 'Admin/User ID' })
  // @IsEntityExist(UserEntity, { message: 'User does not exist' })
  // @IsInt()
  // id: number

  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i, {
    message: 'Password format is incorrect',
  })
  password: string;
}

export class UserExistDto {
  @IsString()
  @Matches(/^[\w-]{4,16}$/)
  @MinLength(6)
  @MaxLength(20)
  username: string;
}
