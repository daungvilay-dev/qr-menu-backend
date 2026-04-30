import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Generated, JoinColumn, ManyToOne } from 'typeorm';

import { BrancheEntity } from '../branche/branche.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity';
import { CommonEntity } from '~/common/entity/common.entity';

@Entity({ name: 'qr_codes' })
export class QrcodeEntity extends CommonEntity {
  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  @ApiProperty({ description: 'QR Code UUID' })
  uuid: string;

  @ManyToOne(() => RestaurantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: RestaurantEntity;

  @ManyToOne(() => BrancheEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch?: BrancheEntity;

  @Column({ name: 'table_number', length: 40, nullable: true })
  @ApiProperty({ description: 'Table Number', required: false })
  tableNumber?: string;

  @Column({ name: 'scan_count', type: 'int', default: 0 })
  @ApiProperty({ description: 'Scan Count' })
  scanCount: number;

  @Column({ name: 'last_scanned_at', type: 'timestamptz', nullable: true })
  @ApiProperty({ description: 'Last Scanned At', required: false })
  lastScannedAt?: Date;
}
