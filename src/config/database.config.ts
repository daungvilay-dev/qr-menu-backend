import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { ConfigType, registerAs } from '@nestjs/config';
import dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import { env, envBoolean, envNumber } from '~/global/env';

const envName = process.env.NODE_ENV ?? 'development';
const envPaths = [`.env.${envName}`, '.env'];

// Ensure env vars are available both for Nest runtime and TypeORM CLI usage
envPaths.forEach((path) => {
  const fullPath = resolve(process.cwd(), path);
  if (existsSync(fullPath)) {
    dotenv.config({ path: fullPath });
  }
});

const buildDataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: env('DB_HOST', '127.0.0.1'),
  port: envNumber('DB_PORT', 5432),
  username: env('DB_USERNAME'),
  password: env('DB_PASSWORD', ''),
  database: env('DB_DATABASE'),
  synchronize: envBoolean('DB_SYNCHRONIZE', false),
  entities: ['dist/modules/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  subscribers: ['dist/modules/**/*.subscriber{.ts,.js}'],
});

export const dbRegToken = 'database';

export const DatabaseConfig = registerAs(
  dbRegToken,
  (): DataSourceOptions => buildDataSourceOptions(),
);

export type IDatabaseConfig = ConfigType<typeof DatabaseConfig>;

const dataSource = new DataSource(buildDataSourceOptions());

export default dataSource;
