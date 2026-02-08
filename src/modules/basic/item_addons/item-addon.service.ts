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
    itemId,
    addonId,
  }: ItemAddonQueryDto): Promise<Pagination<ItemAddonEntity>> {
    const queryBuilder = this.itemAddonRepository
      .createQueryBuilder('itemAddon')
      .where({
        ...(itemId ? { itemId } : null),
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
  async info(itemId: number, addonId: number) {
    const info = await this.itemAddonRepository.findOne({
      where: { itemId, addonId },
    });

    return { ...info };
  }

  /**
   * Add item addon
   */
  async create({ ...data }: ItemAddonDto): Promise<void> {
    await this.itemAddonRepository.save({
      ...data,
    });
  }

  /**
   * Update item addon information
   */
  async update(
    itemId: number,
    addonId: number,
    { ...data }: ItemAddonUpdateDto,
  ): Promise<void> {
    await this.itemAddonRepository.update({ itemId, addonId }, data);
  }

  /**
   * Delete item addon
   */
  async delete(itemId: number, addonId: number): Promise<void> {
    await this.itemAddonRepository.delete({ itemId, addonId });
  }
}
