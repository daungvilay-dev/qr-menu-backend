import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest } from 'fastify';
import Redis from 'ioredis';
import { isEmpty, isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { InjectRedis } from '~/common/decorators/inject-redis.decorator';

import { BusinessException } from '~/common/exceptions/biz.exception';
import { AppConfig, IAppConfig, RouterWhiteList } from '~/config';
import { ErrorEnum } from '~/common/constants/error-code.constant';
import {
  genAuthPVKey,
  genAuthTokenKey,
  genTokenBlacklistKey,
} from '~/helper/genRedisKey';

import { AuthStrategy, PUBLIC_KEY } from '../auth.constant';

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
  // jwtFromRequestFn = function ສຳລັບດຶງ token ຈາກ header Authorization: Bearer <token>
  jwtFromRequestFn = ExtractJwt.fromAuthHeaderAsBearerToken();

  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
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
    const routeUrl = request.routeOptions?.url;

    // ຖ້າ URL ຢູ່ໃນ RouterWhiteList = ປ່ອຍຜ່ານເລີຍ (ບໍ່ກວດ token)
    if (routeUrl && RouterWhiteList.includes(routeUrl)) return true;

    const token = this.jwtFromRequestFn(request);

    // Check if the token is in the blacklist
    if (await this.redis.get(genTokenBlacklistKey(token)))
      throw new BusinessException(ErrorEnum.INVALID_LOGIN);

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

      if (!isNil(token)) throw new BusinessException(ErrorEnum.INVALID_LOGIN);
    }
    const pv = await this.redis.get(genAuthPVKey(request.user.uid));
    if (pv !== `${request.user.pv}`) {
      // Password version mismatch, password has been changed during login
      throw new BusinessException(ErrorEnum.INVALID_LOGIN);
    }

    // Multi-device login is not allowed
    if (!this.appConfig.multiDeviceLogin) {
      const cacheToken = await this.redis.get(genAuthTokenKey(request.user.uid));

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
