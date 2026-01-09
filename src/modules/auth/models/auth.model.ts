import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '~/modules/system/user/user.entity';
export class AuthTokens {
  @ApiProperty({ description: 'Access token (JWT)' })
  accessToken?: string;

  @ApiProperty({ description: 'Access token (JWT)' })
  user?: UserEntity;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken?: string;
}
