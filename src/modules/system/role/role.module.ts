import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleController } from './role.controller';
import { RoleEntity } from './role.entity';
import { RoleService } from './role.service';

const providers = [RoleService];

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  controllers: [RoleController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class RoleModule {}
