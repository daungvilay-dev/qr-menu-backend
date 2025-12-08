import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import Redis from 'ioredis';

import { InjectRedis } from '~/common/decorators/inject-redis.decorator';

import { ISecurityConfig, SecurityConfig } from '~/config';
import { genOnlineUserKey } from '~/helper/genRedisKey';
import { RoleService } from '~/modules/system/role/role.service';
import { UserEntity } from '~/modules/system/user/user.entity';
import { generateUUID } from '~/utils';

import { AccessTokenEntity } from '../entities/access-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AuthTokens } from '../models/auth.model';

/**
 * Token service
 */
@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private roleService: RoleService,
    @InjectRedis() private redis: Redis,
    @Inject(SecurityConfig.KEY) private securityConfig: ISecurityConfig,
  ) {}

  /**
   * Refresh access and refresh tokens based on the current access token
   * @param accessToken
   */
  async refreshToken(accessToken: AccessTokenEntity) {
    const { user, refreshToken } = accessToken;

    if (refreshToken) {
      const now = dayjs();
      // Check if refresh token expired
      if (now.isAfter(refreshToken.expired_at)) return null;

      const roleIds = await this.roleService.getRoleIdsByUser(user.id);
      const roleValues = await this.roleService.getRoleValues(roleIds);

      // If not expired, generate new access_token and refresh_token
      const token = await this.generateAccessToken(user.id, roleValues);

      await accessToken.remove();
      return token;
    }
    return null;
  }

  generateJwtSign(payload: any) {
    const jwtSign = this.jwtService.sign(payload);

    return jwtSign;
  }

  /**
   * Refresh by refresh token value
   */
  async refreshByRefreshToken(
    refreshTokenValue: string,
  ): Promise<{ tokens: AuthTokens; userId: number } | null> {
    try {
      await this.jwtService.verifyAsync(refreshTokenValue, {
        secret: this.securityConfig.refreshSecret,
      });
    } catch (error) {
      return null;
    }

    const refreshToken = await RefreshTokenEntity.findOne({
      where: { value: refreshTokenValue },
      relations: ['accessToken', 'accessToken.user', 'accessToken.refreshToken'],
    });

    if (!refreshToken || !refreshToken.accessToken) return null;

    const tokens = await this.refreshToken(refreshToken.accessToken);

    if (!tokens) return null;

    return { tokens, userId: refreshToken.accessToken.user.id };
  }

  async generateAccessToken(uid: number, roles: string[] = []) {
    const payload: IAuthUser = {
      uid,
      pv: 1,
      roles,
    };

    const jwtSign = await this.jwtService.signAsync(payload);

    // Generate access token
    const accessToken = new AccessTokenEntity();
    accessToken.value = jwtSign;
    accessToken.user = { id: uid } as UserEntity;
    accessToken.expired_at = dayjs()
      .add(this.securityConfig.jwtExprire, 'second')
      .toDate();

    await accessToken.save();

    // Generate refresh token
    const refreshToken = await this.generateRefreshToken(accessToken, dayjs());

    return {
      accessToken: jwtSign,
      refreshToken,
    };
  }

  /**
   * Create a new refresh token and store it in the database
   * @param accessToken
   * @param now
   */
  async generateRefreshToken(
    accessToken: AccessTokenEntity,
    now: dayjs.Dayjs,
  ): Promise<string> {
    const refreshTokenPayload = {
      uuid: generateUUID(),
    };

    const refreshTokenSign = await this.jwtService.signAsync(
      refreshTokenPayload,
      {
        secret: this.securityConfig.refreshSecret,
      },
    );

    const refreshToken = new RefreshTokenEntity();
    refreshToken.value = refreshTokenSign;
    refreshToken.expired_at = now
      .add(this.securityConfig.refreshExpire, 'second')
      .toDate();
    refreshToken.accessToken = accessToken;

    await refreshToken.save();

    return refreshTokenSign;
  }

  /**
   * Check whether the access token exists and is still valid
   * @param value
   */
  async checkAccessToken(value: string) {
    let isValid = false;
    try {
      await this.verifyAccessToken(value);
      const res = await AccessTokenEntity.findOne({
        where: { value },
        relations: ['user', 'refreshToken'],
        cache: true,
      });
      isValid = Boolean(res);
    } catch (error) {}

    return isValid;
  }

  /**
   * Remove access token and cascade removal of its refresh token
   * @param value
   */
  async removeAccessToken(value: string) {
    const accessToken = await AccessTokenEntity.findOne({
      where: { value },
    });
    if (accessToken) {
      this.redis.del(genOnlineUserKey(accessToken.id));
      await accessToken.remove();
    }
  }

  /**
   * Remove refresh token
   * @param value
   */
  async removeRefreshToken(value: string) {
    const refreshToken = await RefreshTokenEntity.findOne({
      where: { value },
      relations: ['accessToken'],
    });
    if (refreshToken) {
      if (refreshToken.accessToken)
        this.redis.del(genOnlineUserKey(refreshToken.accessToken.id));
      await refreshToken.accessToken.remove();
      await refreshToken.remove();
    }
  }

  /**
   * Verify whether the Token is correct. If it is correct, return the user object to which it belongs.
   * @param token
   */
  async verifyAccessToken(token: string): Promise<IAuthUser> {
    return this.jwtService.verifyAsync(token);
  }
}
