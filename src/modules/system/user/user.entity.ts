import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Relation,
} from 'typeorm';

import { CommonEntity } from '../../../common/entity/common.entity';

@Entity({ name: 'sys_user' })
export class UserEntity extends CommonEntity {
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Exclude()
  @Column({ length: 32, select: false })
  psalt: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  status: number;
}
