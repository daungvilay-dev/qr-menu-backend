import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

type Payload = keyof IAuthUser;

/**
 * @description Get the current logged-in user information and mount it on the request
 */
export const AuthUser = createParamDecorator(
  (data: Payload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    // auth guard will mount this
    const user = request.user as IAuthUser;

    return data ? user?.[data] : user;
  },
);
