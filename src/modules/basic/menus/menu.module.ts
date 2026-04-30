import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemAddonEntity } from '../item_addons/item-addon.entity';
import { MenuCategoryEntity } from '../menu_categories/menu-category.entity';

import { MenuController } from './menu.controller';
import { MenuEntity } from './menu.entity';
import { MenuService } from './menu.service';

const providers = [MenuService];

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuEntity, MenuCategoryEntity, ItemAddonEntity]),
  ],
  controllers: [MenuController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class MenuModule {}
