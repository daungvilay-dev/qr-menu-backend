import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { isEmpty, isNil } from 'lodash';
import { EntityManager, In, Like, Repository } from 'typeorm';

import { PagerDto } from '~/common/dto/pager.dto';
import { ROOT_ROLE_ID } from '../../../common/constants/system.constant';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';
import { RoleEntity } from '~/modules/system/role/role.entity';

import { RoleDto, RoleQueryDto, RoleUpdateDto } from './role.dto';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaultRoles();
  }

  /**
   * List all roles: excluding super administrator
   */
  async findAll({ page, limit }: PagerDto): Promise<Pagination<RoleEntity>> {
    return paginate(this.roleRepository, { page, limit });
  }

  /**
   * Query role list
   */
  async list({
    page,
    limit,
    name,
    value,
    remark,
    status,
  }: RoleQueryDto): Promise<Pagination<RoleEntity>> {
    const queryBuilder = await this.roleRepository
      .createQueryBuilder('role')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(value ? { value: Like(`%${value}%`) } : null),
        ...(remark ? { remark: Like(`%${remark}%`) } : null),
        ...(!isNil(status) ? { status } : null),
      });

    return paginate<RoleEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get role information by role ID
   */
  async info(id: number) {
    const info = await this.roleRepository
      .createQueryBuilder('role')
      .where({
        id,
      })
      .getOne();

    return { ...info };
  }

  async delete(id: number): Promise<void> {
    if (id === ROOT_ROLE_ID)
      throw new Error('Cannot delete super administrator');
    await this.roleRepository.delete(id);
  }

  /**
   * Add role
   */
  async create({ ...data }: RoleDto): Promise<{ roleId: number }> {
    const role = await this.roleRepository.save({
      ...data,
    });

    return { roleId: role.id };
  }

  /**
   * Update role information
   * If the passed menuIds is empty, clear the associated data stored in the sys_role_menus table, refer to the addition
   */
  async update(id, { ...data }: RoleUpdateDto): Promise<void> {
    await this.roleRepository.update(id, data);
    await this.entityManager.transaction(async (manager) => {
      const role = await this.roleRepository.findOne({ where: { id } });
      await manager.save(role);
    });
  }

  /**
   * Find role information by user ID
   */
  async getRoleIdsByUser(id: number): Promise<number[]> {
    const roles = await this.roleRepository.find({
      where: {
        users: { id },
      },
    });
    if (!isEmpty(roles)) return roles.map((r) => r.id);
    return [];
  }

  async getRoleValues(ids: number[]): Promise<string[]> {
    return (
      await this.roleRepository.findBy({
        id: In(ids),
      })
    ).map((r) => r.value);
  }

  async isAdminRoleByUser(uid: number): Promise<boolean> {
    const roles = await this.roleRepository.find({
      where: {
        users: { id: uid },
      },
    });

    if (!isEmpty(roles)) {
      return roles.some((r) => r.id === ROOT_ROLE_ID);
    }
    return false;
  }

  hasAdminRole(rids: number[]): boolean {
    return rids.includes(ROOT_ROLE_ID);
  }

  /**
   * Check if there are associated users by role ID
   */
  async checkUserByRoleId(id: number): Promise<boolean> {
    return this.roleRepository.exist({
      where: {
        users: {
          roles: { id },
        },
      },
    });
  }

  /**
   * Seed the initial roles needed by the application.
   */
  private async seedDefaultRoles(): Promise<void> {
    const defaults: Partial<RoleEntity>[] = [
      {
        name: 'Super Admin',
        value: 'super_admin',
        remark: 'Platform super administrator',
        status: 1,
      },
      {
        name: 'Restaurant Owner',
        value: 'restaurant_owner',
        remark: 'Restaurant owner or administrator',
        status: 1,
      },
      {
        name: 'Restaurant Manager',
        value: 'restaurant_manager',
        remark: 'Manages restaurant operations',
        status: 1,
      },
      {
        name: 'Guest',
        value: 'guest',
        remark: 'Guest account with limited access',
        status: 1,
        default: true,
      },
    ];

    const existing = await this.roleRepository.find({
      where: { value: In(defaults.map((role) => role.value)) },
    });

    const existingValues = new Set(existing.map((role) => role.value));
    const missing = defaults.filter((role) => !existingValues.has(role.value));
    if (!missing.length) return;

    // Ensure super admin is inserted first so it keeps the expected ROOT_ROLE_ID on a fresh database.
    const orderedMissing = missing.sort((a, b) => {
      if (a.value === 'super_admin') return -1;
      if (b.value === 'super_admin') return 1;
      return 0;
    });

    await this.roleRepository.save(orderedMissing);
  }
}
