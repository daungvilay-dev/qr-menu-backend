import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { isEmpty } from 'lodash';
import { InjectRedis } from '~/common/decorators/inject-redis.decorator';

import { BusinessException } from '~/common/exceptions/biz.exception';

import {
  AppConfig,
  IAppConfig,
  ISecurityConfig,
  SecurityConfig,
} from '~/config';
import { ErrorEnum } from '~/common/constants/error-code.constant';
import {
  genAuthPermKey,
  genAuthPVKey,
  genAuthTokenKey,
  genTokenBlacklistKey,
} from '~/helper/genRedisKey';

import { UserService } from '~/modules/system/user/user.service';

import { md5 } from '~/utils';

import { RoleService } from '../system/role/role.service';

import { TokenService } from './services/token.service';
import { AuthTokens } from './models/auth.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private roleService: RoleService,
    private userService: UserService,
    private tokenService: TokenService,
    @Inject(SecurityConfig.KEY) private securityConfig: ISecurityConfig,
    @Inject(AppConfig.KEY) private appConfig: IAppConfig,
  ) {}

  async validateUser(credential: string, password: string): Promise<any> {
    const user = await this.userService.findUserByUserName(credential);

    if (isEmpty(user)) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    const comparePassword = md5(`${password}${user.psalt}`);
    if (user.password !== comparePassword)
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD);

    if (user) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  /**
   * Get login JWT
   * If null is returned, the account and password are incorrect and the user does not exist
   */
  async login(username: string, password: string): Promise<AuthTokens> {
    console.log(username);
    const user = await this.userService.findUserByUserName(username);
    console.log('user', user);
    if (isEmpty(user))
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD);

    const comparePassword = md5(`${password}${user.psalt}`);
    console.log(user.password);

    console.log(comparePassword);
    if (user.password !== comparePassword)
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD);

    const roleIds = await this.roleService.getRoleIdsByUser(user.id);

    const roles = await this.roleService.getRoleValues(roleIds);

    // Contains access_token and refresh_token
    const token = await this.tokenService.generateAccessToken(user.id, roles);

    await this.redis.set(
      genAuthTokenKey(user.id),
      token.accessToken,
      'EX',
      this.securityConfig.jwtExprire,
    );

    // Set the password version number. When the password is changed, the version number is increased by 1.
    await this.redis.set(genAuthPVKey(user.id), 1);

    return token;
  }

  async refresh(refreshTokenValue: string): Promise<AuthTokens> {
    const res =
      await this.tokenService.refreshByRefreshToken(refreshTokenValue);

    if (!res) throw new BusinessException(ErrorEnum.INVALID_LOGIN);

    await this.redis.set(
      genAuthTokenKey(res.userId),
      res.tokens.accessToken,
      'EX',
      this.securityConfig.jwtExprire,
    );

    return res.tokens;
  }

  /**
   * Verify account password
   */
  async checkPassword(username: string, password: string) {
    const user = await this.userService.findUserByUserName(username);

    const comparePassword = md5(`${password}${user.psalt}`);
    if (user.password !== comparePassword)
      throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD);
  }

  /**
   * Reset Password
   */
  async resetPassword(username: string, password: string) {
    const user = await this.userService.findUserByUserName(username);

    await this.userService.forceUpdatePassword(user.id, password);
  }

  /**
   * Clear login status information
   */
  async clearLoginStatus(user: IAuthUser, accessToken: string): Promise<void> {
    const exp = user.exp
      ? (user.exp - Date.now() / 1000).toFixed(0)
      : this.securityConfig.jwtExprire;
    await this.redis.set(
      genTokenBlacklistKey(accessToken),
      accessToken,
      'EX',
      exp,
    );
    if (this.appConfig.multiDeviceLogin)
      await this.tokenService.removeAccessToken(accessToken);
    else await this.userService.forbidden(user.uid, accessToken);
  }

  async getPermissionsCache(uid: number): Promise<string[]> {
    const permissionString = await this.redis.get(genAuthPermKey(uid));
    return permissionString ? JSON.parse(permissionString) : [];
  }

  async setPermissionsCache(uid: number, permissions: string[]): Promise<void> {
    await this.redis.set(genAuthPermKey(uid), JSON.stringify(permissions));
  }

  async getPasswordVersionByUid(uid: number): Promise<string> {
    return this.redis.get(genAuthPVKey(uid));
  }

  async getTokenByUid(uid: number): Promise<string> {
    return this.redis.get(genAuthTokenKey(uid));
  }
}
