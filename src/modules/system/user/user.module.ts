import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { RoleEntity } from '../role/role.entity';

const providers = [UserService];

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
  controllers: [UserController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class UserModule {}
