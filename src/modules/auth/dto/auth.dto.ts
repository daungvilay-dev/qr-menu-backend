import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Phone number/Email' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password', example: 'a123456' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  token: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'Account' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Password' })
  @IsString()
  @Matches(/^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])\S*$/i)
  @MinLength(6)
  @MaxLength(16)
  password: string;

  @ApiProperty({ description: 'language', examples: ['EN'] })
  @IsString()
  lang: string;
}

export class RegisterRestaurantDto {
  @ApiProperty({ description: 'Restaurant Name' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({ description: 'Restaurant Slug (public URL)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'Slug can only contain letters, numbers, and hyphens',
  })
  @MinLength(2)
  @MaxLength(160)
  slug: string;

  @ApiProperty({ description: 'Contact Email', required: false })
  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  contactEmail?: string;

  @ApiProperty({ description: 'Phone', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class RegisterRestaurantByUserIdDto extends RegisterRestaurantDto {
  @ApiProperty({ description: 'Owner User ID' })
  @IsInt()
  @Min(1)
  userId: number;
}
