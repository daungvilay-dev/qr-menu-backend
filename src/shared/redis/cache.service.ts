import type { Redis } from 'ioredis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { API_CACHE_PREFIX } from '~/common/constants/cache.constant';
import { getRedisKey } from '~/utils/redis.util';

export type TCacheKey = string;
export type TCacheResult<T> = Promise<T | undefined>;

@Injectable()
export class CacheService {
  private cache!: Cache;
  constructor(@Inject(CACHE_MANAGER) cache: Cache) {
    this.cache = cache;
  }

  private get redisClient(): Redis {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return this.cache.store.client;
  }

  public get<T>(key: TCacheKey): TCacheResult<T> {
    return this.cache.get(key);
  }

  public set(key: TCacheKey, value: any, milliseconds: number) {
    return this.cache.set(key, value, milliseconds);
  }

  public del(key: TCacheKey) {
    return this.cache.del(key);
  }

  public getClient() {
    return this.redisClient;
  }

  public async cleanCatch() {
    const redis = this.getClient();
    const keys: string[] = await redis.keys(`${API_CACHE_PREFIX}*`);
    await Promise.all(keys.map((key) => redis.del(key)));
  }

  public async cleanAllRedisKey() {
    const redis = this.getClient();
    const keys: string[] = await redis.keys(getRedisKey('*'));

    await Promise.all(keys.map((key) => redis.del(key)));
  }
}
