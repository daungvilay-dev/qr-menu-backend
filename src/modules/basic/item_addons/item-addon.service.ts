import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';

import {
  ItemAddonDto,
  ItemAddonQueryDto,
  ItemAddonUpdateDto,
} from './item-addon.dto';
import { ItemAddonEntity } from './item-addon.entity';

@Injectable()
export class ItemAddonService {
  constructor(
    @InjectRepository(ItemAddonEntity)
    private itemAddonRepository: Repository<ItemAddonEntity>,
  ) {}

  /**
   * Query item addon list
   */
  async list({
    page,
    limit,
    menuId,
    addonId,
  }: ItemAddonQueryDto): Promise<Pagination<ItemAddonEntity>> {
    const queryBuilder = this.itemAddonRepository
      .createQueryBuilder('itemAddon')
      .where({
        ...(menuId ? { menuId } : null),
        ...(addonId ? { addonId } : null),
      });

    return paginate<ItemAddonEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get item addon information by IDs
   */
  async info(menuId: number, addonId: number) {
    const info = await this.itemAddonRepository.findOne({
      where: { menuId, addonId },
      relations: {
        menu: true,
        addon: true,
      },
    });

    return { ...info };
  }

  /**
   * Add item addon
   */
  async create({ ...data }: ItemAddonDto): Promise<void> {
    console.log(data);
    await this.itemAddonRepository.save({
      ...data,
    });
  }

  /**
   * Update item addon information
   */
  async update(
    menuId: number,
    addonId: number,
    { ...data }: ItemAddonUpdateDto,
  ): Promise<void> {
    await this.itemAddonRepository.update({ menuId, addonId }, data);
  }

  /**
   * Delete item addon
   */
  async delete(menuId: number, addonId: number): Promise<void> {
    await this.itemAddonRepository.delete({ menuId, addonId });
  }
}
