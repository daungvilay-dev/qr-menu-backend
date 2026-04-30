import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from '../menus/menu.entity';

import { VariantController } from './variant.controller';
import { VariantEntity } from './variant.entity';
import { VariantService } from './variant.service';

const providers = [VariantService];

@Module({
  imports: [TypeOrmModule.forFeature([VariantEntity, MenuEntity])],
  controllers: [VariantController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class VariantModule {}
