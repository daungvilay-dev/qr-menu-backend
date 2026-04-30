import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Like, Repository } from 'typeorm';

import { ErrorEnum } from '~/common/constants/error-code.constant';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';

import { AddonDto, AddonQueryDto, AddonUpdateDto } from './addon.dto';
import { AddonEntity } from './addon.entity';

@Injectable()
export class AddonService {
  constructor(
    @InjectRepository(AddonEntity)
    private addonRepository: Repository<AddonEntity>,
  ) {}

  /**
   * Query addon list
   */
  async listByRestaurant(
    restaurantId: number,
    { page, limit, menuId, name, isActive }: AddonQueryDto,
  ): Promise<Pagination<AddonEntity>> {
    const queryBuilder = this.addonRepository
      .createQueryBuilder('addon')
      .leftJoin('addon.restaurant', 'restaurant')
      .leftJoin('restaurant.owner', 'owner')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(!isNil(isActive) ? { isActive } : null),
      });
    queryBuilder.andWhere('restaurant.id = :restaurantId', { restaurantId });
    if (menuId) {
      queryBuilder
        .innerJoin('item_addons', 'itemAddon', 'itemAddon.addon_id = addon.id')
        .andWhere('itemAddon.item_id = :menuId', { menuId });
    }

    return paginate<AddonEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get addon information by ID
   */
  async infoByRestaurant(id: number, restaurantId: number) {
    const info = await this.addonRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: {
        restaurant: {
          owner: true,
        },
      },
    });
    if (!info)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    return { ...info };
  }

  /**
   * Add addon
   */
  async createByRestaurant(
    restaurantId: number,
    { ...data }: AddonDto,
  ): Promise<{ addonId: number }> {
    const addon = await this.addonRepository.save({
      ...data,
      restaurant: { id: restaurantId } as any,
    });

    return { addonId: addon.id };
  }

  /**
   * Update addon information
   */
  async updateByRestaurant(
    id: number,
    restaurantId: number,
    { ...data }: AddonUpdateDto,
  ): Promise<void> {
    const addon = await this.addonRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: { restaurant: true },
    });
    if (!addon)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    if (data.name !== undefined) addon.name = data.name;
    if (data.price !== undefined) addon.price = data.price;
    if (data.currency !== undefined) addon.currency = data.currency;
    if (data.isActive !== undefined) addon.isActive = data.isActive;
    if (data.sortOrder !== undefined) addon.sortOrder = data.sortOrder;

    await this.addonRepository.save(addon);
  }

  /**
   * Delete addon
   */
  async deleteByRestaurant(id: number, restaurantId: number): Promise<void> {
    const result = await this.addonRepository
      .createQueryBuilder()
      .delete()
      .from(AddonEntity)
      .where('id = :id', { id })
      .andWhere('restaurant_id = :restaurantId', { restaurantId })
      .execute();
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }
}
