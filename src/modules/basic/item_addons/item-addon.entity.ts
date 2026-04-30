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
import { CommonEntity } from '~/common/entity/common.entity';

@Entity({ name: 'item_addons' })
@Index(['menuId', 'addonId'], { unique: true })
export class ItemAddonEntity {
  @PrimaryColumn({ name: 'menu_id', type: 'int' })
  @ApiProperty({ description: 'Menu Item ID' })
  menuId: number;

  @ManyToOne(() => MenuEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu?: MenuEntity;

  @PrimaryColumn({ name: 'addon_id', type: 'int' })
  @ApiProperty({ description: 'Addon ID' })
  addonId: number;

  @ManyToOne(() => AddonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addon_id' })
  addon?: AddonEntity;
}
