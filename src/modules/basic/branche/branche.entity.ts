import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '~/common/entity/common.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';

@Entity({ name: 'branches' })
export class BrancheEntity extends CommonEntity {
  @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @Column({ length: 120 })
  @ApiProperty({ description: 'Branch Name' })
  name: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Branch Slug' })
  slug: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Address', required: false })
  address?: string | null;

  @Column({ length: 40, nullable: true })
  @ApiProperty({ description: 'Phone', required: false })
  phone?: string | null;

  @Column({ length: 64, default: 'Asia/Vientiane' })
  @ApiProperty({ description: 'Timezone' })
  timezone: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Is Active' })
  isActive: boolean;
}
