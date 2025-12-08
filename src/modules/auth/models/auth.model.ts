import { ApiProperty } from '@nestjs/swagger';
export class LoginToken {
  @ApiProperty({ description: 'JWT Identity Token' })
  token: string;
}
