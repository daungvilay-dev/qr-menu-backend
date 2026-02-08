import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '~/common/entity/common.entity';
import { MenuEntity } from '../menus/menu.entity';

@Entity({ name: 'variants' })
export class VariantEntity extends CommonEntity {
  @ManyToOne(() => MenuEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu?: MenuEntity;

  @Column({ length: 120 })
  @ApiProperty({ description: 'Variant Name' })
  name: string;

  @Column({ name: 'price_delta_cents', type: 'int', default: 0 })
  @ApiProperty({ description: 'Price Delta (cents)' })
  priceDeltaCents: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Is Active' })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @ApiProperty({ description: 'Sort Order' })
  sortOrder: number;
}
