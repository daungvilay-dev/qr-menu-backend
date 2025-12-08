import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import { isEmpty, isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { BusinessException } from '~/common/exceptions/biz.exception';
import { AppConfig, IAppConfig, RouterWhiteList } from '~/config';
import { ErrorEnum } from '~/common/constants/error-code.constant';
import { genTokenBlacklistKey } from '~/helper/genRedisKey';

import { AuthService } from '~/modules/auth/auth.service';
import { AuthStrategy, PUBLIC_KEY } from '../auth.constant';
import { TokenService } from '../services/token.service';

/** @type {import('fastify').RequestGenericInterface} */
interface RequestType {
  Params: {
    uid?: string;
  };
  Querystring: {
    token?: string;
  };
}

// https://docs.nestjs.com/recipes/passport#implement-protected-route-and-jwt-strategy-guards
@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT) {
  jwtFromRequestFn = ExtractJwt.fromAuthHeaderAsBearerToken();

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private tokenService: TokenService,
    @Inject(AppConfig.KEY) private appConfig: IAppConfig,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest<RequestType>>();
    // const response = context.switchToHttp().getResponse<FastifyReply>()
    if (RouterWhiteList.includes(request.routeOptions.url)) return true;
    // TODO The purpose of the code here is to determine if the user's add, delete, or modify operations are rejected in the demonstration environment. Removing this code will not affect the normal business logic.
    if (request.method !== 'GET' && !request.url.includes('/auth/login'))
      const isSse = request.headers.accept === 'text/event-stream';

    if (isSse && !request.headers.authorization?.startsWith('Bearer ')) {
      const { token } = request.query;
      if (token) request.headers.authorization = `Bearer ${token}`;
    }

    const token = this.jwtFromRequestFn(request);

    request.accessToken = token;

    let result: any = false;
    try {
      result = await super.canActivate(context);
    } catch (err) {
      // Need to post-judge so that users with tokens can parse request.user
      if (isPublic) return true;

      if (isEmpty(token)) throw new UnauthorizedException('Not logged in');

      // In handleRequest, when user is null, UnauthorizedException will be thrown
      if (err instanceof UnauthorizedException)
        throw new BusinessException(ErrorEnum.INVALID_LOGIN);

      // Determine whether the token is valid and exists, if not, authentication fails
      const isValid = isNil(token)
        ? undefined
        : await this.tokenService.checkAccessToken(token!);

      if (!isValid) throw new BusinessException(ErrorEnum.INVALID_LOGIN);
    }

    // SSE request
    if (isSse) {
      const { uid } = request.params;

      if (Number(uid) !== request.user.uid)
        throw new UnauthorizedException(
          'Path parameter uid does not match the uid of the currently logged-in user',
        );
    }

    const pv = await this.authService.getPasswordVersionByUid(request.user.uid);
    if (pv !== `${request.user.pv}`) {
      // Password version mismatch, password has been changed during login
      throw new BusinessException(ErrorEnum.INVALID_LOGIN);
    }

    // Multi-device login is not allowed
    if (!this.appConfig.multiDeviceLogin) {
      const cacheToken = await this.authService.getTokenByUid(request.user.uid);

      if (token !== cacheToken) {
        // Inconsistent with the one saved in redis, i.e., logged in again
        throw new BusinessException(ErrorEnum.ACCOUNT_LOGGED_IN_ELSEWHERE);
      }
    }

    return result;
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) throw err || new UnauthorizedException();

    return user;
  }
}
