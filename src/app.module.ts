import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DepartmentModule } from './department/department.module';

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

    UsersModule,
    DepartmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
