import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Like, Repository } from 'typeorm';

import { ErrorEnum } from '~/common/constants/error-code.constant';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';
import { MenuEntity } from '../menus/menu.entity';

import { VariantDto, VariantQueryDto, VariantUpdateDto } from './variant.dto';
import { VariantEntity } from './variant.entity';

@Injectable()
export class VariantService {
  constructor(
    @InjectRepository(VariantEntity)
    private variantRepository: Repository<VariantEntity>,
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
  ) {}

  /**
   * Query variant list
   */
  async list(
    restaurantId: number,
    { page, limit, menuId, name, isActive }: VariantQueryDto,
  ): Promise<Pagination<VariantEntity>> {
    const queryBuilder = this.variantRepository
      .createQueryBuilder('variant')
      .leftJoin('variant.menu', 'menu')
      .leftJoin('menu.restaurant', 'restaurant')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(!isNil(isActive) ? { isActive } : null),
      });
    queryBuilder.andWhere('restaurant.id = :restaurantId', { restaurantId });
    if (menuId) queryBuilder.andWhere('menu.id = :menuId', { menuId });

    return paginate<VariantEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get variant information by ID
   */
  async info(id: number, restaurantId: number) {
    const info = await this.variantRepository.findOne({
      where: { id, menu: { restaurant: { id: restaurantId } } },
      relations: { menu: true },
    });
    if (!info)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    return { ...info };
  }

  /**
   * Add variant
   */
  async create(
    restaurantId: number,
    { menuId, ...data }: VariantDto,
  ): Promise<{ variantId: number }> {
    const menu = await this.menuRepository.findOne({
      where: { id: menuId, restaurant: { id: restaurantId } },
    });
    if (!menu)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    const variant = await this.variantRepository.save({
      ...data,
      menu: { id: menuId } as any,
    });

    return { variantId: variant.id };
  }

  /**
   * Update variant information
   */
  async update(
    id: number,
    restaurantId: number,
    { menuId, ...data }: VariantUpdateDto,
  ): Promise<void> {
    if (menuId !== undefined) {
      const menu = await this.menuRepository.findOne({
        where: { id: menuId, restaurant: { id: restaurantId } },
      });
      if (!menu)
        throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
    }

    const variant = await this.variantRepository.findOne({
      where: { id, menu: { restaurant: { id: restaurantId } } },
      relations: { menu: true },
    });
    if (!variant)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    if (menuId !== undefined) variant.menu = { id: menuId } as any;
    if (data.name !== undefined) variant.name = data.name;
    if (data.priceDeltaCents !== undefined)
      variant.priceDeltaCents = data.priceDeltaCents;
    if (data.isActive !== undefined) variant.isActive = data.isActive;
    if (data.sortOrder !== undefined) variant.sortOrder = data.sortOrder;

    await this.variantRepository.save(variant);
  }

  /**
   * Delete variant
   */
  async delete(id: number, restaurantId: number): Promise<void> {
    const result = await this.variantRepository
      .createQueryBuilder()
      .delete()
      .from(VariantEntity)
      .where('id = :id', { id })
      .andWhere(
        'menu_id IN (SELECT id FROM menus WHERE restaurant_id = :restaurantId)',
        {
          restaurantId,
        },
      )
      .execute();
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }
}
