import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '~/common/entity/common.entity';
import { BrancheEntity } from '../branche/branche.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

@Entity({ name: 'menu_categories' })
export class MenuCategoryEntity extends CommonEntity {
  @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @ManyToOne(() => BrancheEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch?: BrancheEntity | null;

  @Column({ length: 120 })
  @ApiProperty({ description: 'Category Name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  description?: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @ApiProperty({ description: 'Sort Order' })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Is Active' })
  isActive: boolean;
}
