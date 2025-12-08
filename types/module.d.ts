import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: IAuthUser;
    accessToken: string;
  }
}

declare module 'nestjs-cls' {
  interface ClsStore {
    operateId: number;
  }
}
