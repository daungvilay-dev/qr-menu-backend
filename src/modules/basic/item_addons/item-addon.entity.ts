import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { AddonEntity } from '../addons/addon.entity';
import { MenuEntity } from '../menus/menu.entity';

@Entity({ name: 'item_addons' })
@Index(['itemId', 'addonId'], { unique: true })
export class ItemAddonEntity {
  @PrimaryColumn({ name: 'item_id', type: 'int' })
  @ApiProperty({ description: 'Menu Item ID' })
  itemId: number;

  @ManyToOne(() => MenuEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  menu?: MenuEntity;

  @PrimaryColumn({ name: 'addon_id', type: 'int' })
  @ApiProperty({ description: 'Addon ID' })
  addonId: number;

  @ManyToOne(() => AddonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addon_id' })
  addon?: AddonEntity;
}
