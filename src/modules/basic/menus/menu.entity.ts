import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '~/common/entity/common.entity';
import { MenuCategoryEntity } from '../menu_categories/menu-category.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

@Entity({ name: 'menus' })
export class MenuEntity extends CommonEntity {
  @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @ManyToOne(() => MenuCategoryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category?: MenuCategoryEntity;

  @Column({ length: 150 })
  @ApiProperty({ description: 'Menu Name' })
  name: string;

  @Column({ length: 150, nullable: true })
  @ApiProperty({ description: 'Image', required: false })
  img?: string | null;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  description?: string | null;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Price (minor units)' })
  price: number;

  @Column({ default: 'LAK' })
  @ApiProperty({ description: 'Currency' })
  currency: string;

  @Column({ name: 'is_available', type: 'boolean', default: true })
  @ApiProperty({ description: 'Is Available' })
  isAvailable: boolean;

  @Column({ name: 'spicy_level', type: 'int', default: 0 })
  @ApiProperty({ description: 'Spicy Level (0-3)' })
  spicyLevel: number;

  @Column({ name: 'is_veg', type: 'boolean', default: false })
  @ApiProperty({ description: 'Is Vegetarian' })
  isVeg: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @ApiProperty({ description: 'Sort Order' })
  sortOrder: number;
}
