import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrancheEntity } from '../branche/branche.entity';

import { MenuCategoryController } from './menu-category.controller';
import { MenuCategoryEntity } from './menu-category.entity';
import { MenuCategoryService } from './menu-category.service';

const providers = [MenuCategoryService];

@Module({
  imports: [TypeOrmModule.forFeature([MenuCategoryEntity, BrancheEntity])],
  controllers: [MenuCategoryController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class MenuCategoryModule {}
