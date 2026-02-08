import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddonController } from './addon.controller';
import { AddonEntity } from './addon.entity';
import { AddonService } from './addon.service';

const providers = [AddonService];

@Module({
  imports: [TypeOrmModule.forFeature([AddonEntity])],
  controllers: [AddonController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class AddonModule {}
