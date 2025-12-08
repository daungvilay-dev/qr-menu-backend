import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleModule } from './modules/system/role/role.module';
import { UserModule } from './modules/system/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './shared/database/database.module';
import { SharedModule } from '~/shared/shared.module';
import config, { AppConfig, DatabaseConfig, SecurityConfig } from '~/config';

const envName = process.env.NODE_ENV ?? 'development';
const envFilePath = ['.env.local', `.env.${envName}`, '.env'];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath,
      load: [...Object.values(config)],
    }),
    SharedModule,
    DatabaseModule,

    RoleModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
