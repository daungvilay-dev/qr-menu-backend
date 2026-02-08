import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Relation,
} from 'typeorm';

import { CommonEntity } from '~/common/entity/common.entity';
import { BrancheEntity } from '../branche/branche.entity';
import { UserEntity } from '~/modules/system/user/user.entity';

@Entity({ name: 'baic_restaurant' })
export class RestaurantEntity extends CommonEntity {
  @Column({ length: 150 })
  @ApiProperty({ description: 'Restaurant Name' })
  name: string;

  @Column({ length: 160, unique: true })
  @ApiProperty({ description: 'Restaurant Slug (public URL)' })
  slug: string;

  @Column({ name: 'contact_email', length: 200, nullable: true })
  @ApiProperty({ description: 'Contact Email', required: false })
  contactEmail?: string | null;

  @Column({ length: 40, nullable: true })
  @ApiProperty({ description: 'Phone', required: false })
  phone?: string | null;

  @Column({ name: 'logo', type: 'text', nullable: true })
  @ApiProperty({ description: 'Logo', required: false })
  logo?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: 'Is Active' })
  isActive: boolean;

  @Column({ name: 'owner_id', type: 'int' })
  @ApiProperty({ description: 'Owner User ID' })
  ownerId: number;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner: Relation<UserEntity>;

  @OneToMany(() => BrancheEntity, (branch) => branch.restaurant)
  branches?: Relation<BrancheEntity[]>;
}
