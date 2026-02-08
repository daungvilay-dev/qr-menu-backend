import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantController } from './restaurant.controller';
import { RestaurantEntity } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

const providers = [RestaurantService];

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity])],
  controllers: [RestaurantController],
  providers: [...providers],
  exports: [TypeOrmModule, ...providers],
})
export class RestaurantModule {}
