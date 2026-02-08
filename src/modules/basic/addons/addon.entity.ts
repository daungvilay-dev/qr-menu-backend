import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '~/common/entity/common.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

@Entity({ name: 'addons' })
export class AddonEntity extends CommonEntity {
  @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @Column({ length: 120 })
  @ApiProperty({ description: 'Addon Name' })
  name: string;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Price (minor units)' })
  price: number;

  @Column({ default: 'LAK' })
  @ApiProperty({ description: 'Currency' })
  currency: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Is Active' })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @ApiProperty({ description: 'Sort Order' })
  sortOrder: number;
}
