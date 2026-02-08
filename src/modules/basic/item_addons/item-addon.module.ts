import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemAddonController } from './item-addon.controller';
import { ItemAddonEntity } from './item-addon.entity';
import { ItemAddonService } from './item-addon.service';

const providers = [ItemAddonService];

@Module({
  imports: [TypeOrmModule.forFeature([ItemAddonEntity])],
  controllers: [ItemAddonController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class ItemAddonModule {}
