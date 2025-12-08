import { AppConfig, appRegToken, IAppConfig } from './app.config';
import { DatabaseConfig, dbRegToken, IDatabaseConfig } from './database.config';
import { IRedisConfig, RedisConfig, redisRegToken } from './redis.config';
import {
  ISecurityConfig,
  SecurityConfig,
  securityRegToken,
} from './security.config';

export * from './app.config';
export * from './redis.config';
export * from './database.config';
export * from './security.config';

export interface AllConfigType {
  [appRegToken]: IAppConfig;
  [dbRegToken]: IDatabaseConfig;
  [redisRegToken]: IRedisConfig;
  [securityRegToken]: ISecurityConfig;
}

export type ConfigKeyPaths = RecordNamePaths<AllConfigType>;

export default {
  AppConfig,
  DatabaseConfig,
  RedisConfig,
  SecurityConfig,
};
