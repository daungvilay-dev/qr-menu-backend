import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { BusinessException } from '~/common/exceptions/biz.exception';
import { ErrorEnum } from '~/common/constants/error-code.constant';

import {
  ALLOW_ANON_KEY,
  PERMISSION_KEY,
  PUBLIC_KEY,
  ROLE_KEY,
  Roles,
} from '../auth.constant';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const { user } = request;
    if (!user) throw new BusinessException(ErrorEnum.INVALID_LOGIN);

    // allowAnon means accessible after login (no permissions required), Public means accessible without login.
    const allowAnon = this.reflector.get<boolean>(
      ALLOW_ANON_KEY,
      context.getHandler(),
    );
    if (allowAnon) return true;

    const payloadRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // console.log(12323, payloadRoles);
    // console.log(user.roles);

    if (payloadRoles?.length) {
      const hasRole = user.roles?.some((role) => payloadRoles.includes(role));
      if (!hasRole) throw new BusinessException(ErrorEnum.NO_PERMISSION);
      return true;
    }

    return true;
  }
}
