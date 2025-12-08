import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { BusinessException } from '~/common/exceptions/biz.exception';
import { ErrorEnum } from '~/common/constants/error-code.constant';
import { AuthService } from '~/modules/auth/auth.service';

import {
  ALLOW_ANON_KEY,
  PERMISSION_KEY,
  PUBLIC_KEY,
  Roles,
} from '../auth.constant';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

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

    const payloadPermission = this.reflector.getAllAndOverride<
      string | string[]
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    // If the controller does not set interface permissions, it defaults to passing
    if (!payloadPermission) return true;

    // Admins have all permissions
    if (user.roles.includes(Roles.ADMIN)) return true;

    const allPermissions = [];
    //   (await this.authService.getPermissionsCache(user.uid)) ??
    //   (await this.authService.getPermissions(user.uid));
    // console.log(allPermissions)
    let canNext = false;

    // handle permission strings
    if (Array.isArray(payloadPermission)) {
      // Only one permission needs to be satisfied
      canNext = payloadPermission.every((i) => allPermissions.includes(i));
    }

    if (typeof payloadPermission === 'string')
      canNext = allPermissions.includes(payloadPermission);

    if (!canNext) throw new BusinessException(ErrorEnum.NO_PERMISSION);

    return true;
  }
}
