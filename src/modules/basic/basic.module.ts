import { Module } from '@nestjs/common';

import { RouterModule } from '@nestjs/core';
import { AddonModule } from './addons/addon.module';
import { BrancheModule } from './branche/branche.module';
import { ItemAddonModule } from './item_addons/item-addon.module';
import { MenuCategoryModule } from './menu_categories/menu-category.module';
import { MenuModule } from './menus/menu.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { VariantModule } from './variants/variant.module';

const modules = [
  RestaurantModule,
  BrancheModule,
  QrcodeModule,
  MenuCategoryModule,
  MenuModule,
  VariantModule,
  AddonModule,
  ItemAddonModule,
];

@Module({
  imports: [
    ...modules,
    RouterModule.register([
      {
        path: 'basic',
        module: BasicModule,
        children: [...modules],
      },
    ]),
  ],
  exports: [...modules],
})
export class BasicModule {}
