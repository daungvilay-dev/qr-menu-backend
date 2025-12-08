import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoleModule } from './modules/system/role/role.module';
import { UserModule } from './modules/system/user/user.module';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: '11111111',
      database: 'qrmenu',
      autoLoadEntities: true,
      synchronize: true,
    }),
    RoleModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
