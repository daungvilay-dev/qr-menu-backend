import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinTable, ManyToMany, Relation } from 'typeorm';

import { CompleteEntity } from '~/common/entity/common.entity';

import { UserEntity } from '../user/user.entity';

@Entity({ name: 'sys_role' })
export class RoleEntity extends CompleteEntity {
  @Column({ length: 50, unique: true })
  @ApiProperty({ description: 'Role Name' })
  name: string;

  @Column({ unique: true, comment: 'Role Identifier' })
  @ApiProperty({ description: 'Role Identifier' })
  value: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Role Description' })
  remark: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  @ApiProperty({ description: 'Status: 1 Enabled, 0 Disabled' })
  status: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Is Default User' })
  default: boolean;

  @ApiHideProperty()
  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: Relation<UserEntity[]>;
}
