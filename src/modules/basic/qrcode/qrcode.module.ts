import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemAddonEntity } from '../item_addons/item-addon.entity';
import { MenuCategoryEntity } from '../menu_categories/menu-category.entity';
import { MenuEntity } from '../menus/menu.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

import { QrcodeController } from './qrcode.controller';
import { QrcodeEntity } from './qrcode.entity';
import { QrcodeService } from './qrcode.service';

const providers = [QrcodeService];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QrcodeEntity,
      RestaurantEntity,
      MenuCategoryEntity,
      MenuEntity,
      ItemAddonEntity,
    ]),
  ],
  controllers: [QrcodeController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class QrcodeModule {}
