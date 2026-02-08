import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Like, Repository } from 'typeorm';

import { ErrorEnum } from '~/common/constants/error-code.constant';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';
import { MenuCategoryEntity } from '../menu_categories/menu-category.entity';

import { MenuDto, MenuQueryDto, MenuUpdateDto } from './menu.dto';
import { MenuEntity } from './menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
    @InjectRepository(MenuCategoryEntity)
    private menuCategoryRepository: Repository<MenuCategoryEntity>,
  ) {}

  /**
   * Query menu list
   */
  async list(
    restaurantId: number,
    { page, limit, categoryId, name, isAvailable }: MenuQueryDto,
  ): Promise<Pagination<MenuEntity>> {
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoin('menu.restaurant', 'restaurant')
      .where('restaurant.id = :restaurantId', { restaurantId });

    if (categoryId)
      queryBuilder.andWhere('menu.category_id = :categoryId', { categoryId });
    if (name) queryBuilder.andWhere('menu.name LIKE :name', { name: `%${name}%` });
    if (!isNil(isAvailable))
      queryBuilder.andWhere('menu.is_available = :isAvailable', { isAvailable });

    return paginate<MenuEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get menu information by ID
   */
  async info(id: number, restaurantId: number) {
    const info = await this.menuRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: { restaurant: true, category: true },
    });
    if (!info)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    return { ...info };
  }

  /**
   * Add menu
   */
  async create(
    restaurantId: number,
    { categoryId, name, img, description, price, currency, isAvailable, spicyLevel, isVeg, sortOrder }: MenuDto,
  ): Promise<{ menuId: number }> {
    const category = await this.menuCategoryRepository.findOne({
      where: { id: categoryId, restaurant: { id: restaurantId } },
    });
    if (!category)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    const menu = await this.menuRepository.save({
      name,
      img,
      description,
      price,
      currency,
      isAvailable,
      spicyLevel,
      isVeg,
      sortOrder,
      restaurant: { id: restaurantId } as any,
      category: { id: categoryId } as any,
    });

    return { menuId: menu.id };
  }

  /**
   * Update menu information
   */
  async update(
    id: number,
    restaurantId: number,
    { categoryId, name, img, description, price, currency, isAvailable, spicyLevel, isVeg, sortOrder }: MenuUpdateDto,
  ): Promise<void> {
    if (categoryId) {
      const category = await this.menuCategoryRepository.findOne({
        where: { id: categoryId, restaurant: { id: restaurantId } },
      });
      if (!category)
        throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
    }

    const menu = await this.menuRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: { category: true, restaurant: true },
    });
    if (!menu)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    if (categoryId) menu.category = { id: categoryId } as any;
    if (name !== undefined) menu.name = name;
    if (img !== undefined) menu.img = img;
    if (description !== undefined) menu.description = description;
    if (price !== undefined) menu.price = price;
    if (currency !== undefined) menu.currency = currency;
    if (isAvailable !== undefined) menu.isAvailable = isAvailable;
    if (spicyLevel !== undefined) menu.spicyLevel = spicyLevel;
    if (isVeg !== undefined) menu.isVeg = isVeg;
    if (sortOrder !== undefined) menu.sortOrder = sortOrder;

    await this.menuRepository.save(menu);
  }

  /**
   * Delete menu
   */
  async delete(id: number, restaurantId: number): Promise<void> {
    const result = await this.menuRepository
      .createQueryBuilder()
      .delete()
      .from(MenuEntity)
      .where('id = :id', { id })
      .andWhere('restaurant_id = :restaurantId', { restaurantId })
      .execute();
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }
}
