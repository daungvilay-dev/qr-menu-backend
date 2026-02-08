import {
  RedisModule as NestRedisModule,
  RedisService,
} from '@liaoliaots/nestjs-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisOptions } from 'ioredis';

import { REDIS_CLIENT } from '~/common/decorators/inject-redis.decorator';

import { ConfigKeyPaths, IRedisConfig } from '~/config';
import { CacheService } from './cache.service';

const getRedisOptions = (
  configService: ConfigService<ConfigKeyPaths>,
): RedisOptions => {
  const options = configService.get<IRedisConfig>('redis');
  if (!options) {
    throw new Error('Redis config is missing');
  }

  return options;
};

const providers: Provider[] = [
  CacheService,
  {
    provide: REDIS_CLIENT,
    useFactory: (redisService: RedisService) => {
      return redisService.getOrThrow();
    },
    inject: [RedisService],
  },
];

@Global()
@Module({
  imports: [
    // cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigKeyPaths>) => {
        return {
          isGlobal: true,
          store: redisStore,
          isCacheableValue: () => true,
          ...getRedisOptions(configService),
        };
      },
      inject: [ConfigService],
    }),
    // redis
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigKeyPaths>) => ({
        readyLog: true,
        config: getRedisOptions(configService),
      }),
      inject: [ConfigService],
    }),
  ],
  providers,
  exports: [...providers, CacheModule],
})
export class RedisModule {}
