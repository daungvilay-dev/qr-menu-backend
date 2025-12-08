import { ApiProperty } from '@nestjs/swagger';

export class ImageCaptcha {
  @ApiProperty({ description: 'SVG image in base64 format' })
  img: string;

  @ApiProperty({
    description: 'Unique ID corresponding to the verification code',
  })
  id: string;
}

export class LoginToken {
  @ApiProperty({ description: 'JWT Identity Token' })
  token: string;
}
