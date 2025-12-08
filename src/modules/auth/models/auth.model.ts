import { ApiProperty } from '@nestjs/swagger';
export class AuthTokens {
  @ApiProperty({ description: 'Access token (JWT)' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}
