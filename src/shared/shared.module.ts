import { Global, Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  imports: [
    // redis
    RedisModule,
  ],
  exports: [RedisModule],
})
export class SharedModule {}
