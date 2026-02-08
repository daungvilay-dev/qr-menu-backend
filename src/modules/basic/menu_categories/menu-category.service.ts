import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Like, Repository } from 'typeorm';

import { ErrorEnum } from '~/common/constants/error-code.constant';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';
import { BrancheEntity } from '../branche/branche.entity';

import {
  MenuCategoryDto,
  MenuCategoryQueryDto,
  MenuCategoryUpdateDto,
} from './menu-category.dto';
import { MenuCategoryEntity } from './menu-category.entity';

@Injectable()
export class MenuCategoryService {
  constructor(
    @InjectRepository(MenuCategoryEntity)
    private menuCategoryRepository: Repository<MenuCategoryEntity>,
    @InjectRepository(BrancheEntity)
    private brancheRepository: Repository<BrancheEntity>,
  ) {}

  /**
   * Query menu category list
   */
  async listByRestaurant(
    restaurantId: number,
    { page, limit, branchId, name, isActive }: MenuCategoryQueryDto,
  ): Promise<Pagination<MenuCategoryEntity>> {
    const queryBuilder = this.menuCategoryRepository
      .createQueryBuilder('menuCategory')
      .leftJoin('menuCategory.restaurant', 'restaurant')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(!isNil(isActive) ? { isActive } : null),
      });
    queryBuilder.andWhere('restaurant.id = :restaurantId', { restaurantId });
    if (branchId)
      queryBuilder.andWhere('menuCategory.branch_id = :branchId', { branchId });

    return paginate<MenuCategoryEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get menu category information by ID
   */
  async infoByRestaurant(id: number, restaurantId: number) {
    const info = await this.menuCategoryRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: { restaurant: true, branch: true },
    });
    if (!info)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    return { ...info };
  }

  /**
   * Add menu category
   */
  async createByRestaurant(
    restaurantId: number,
    { ...data }: MenuCategoryDto,
  ): Promise<{ categoryId: number }> {
    if (!restaurantId)
      throw new BadRequestException('Restaurant ID is required');
    if (data.branchId) {
      const branch = await this.brancheRepository.findOne({
        where: { id: data.branchId, restaurant: { id: restaurantId } },
      });
      if (!branch)
        throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
    }

    const category = await this.menuCategoryRepository.save({
      name: data.name,
      description: data.description,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      restaurant: { id: restaurantId } as any,
      ...(data.branchId !== undefined
        ? { branch: data.branchId ? ({ id: data.branchId } as any) : null }
        : null),
    });

    return { categoryId: category.id };
  }

  /**
   * Update menu category information
   */
  async updateByRestaurant(
    id: number,
    restaurantId: number,
    { ...data }: MenuCategoryUpdateDto,
  ): Promise<void> {
    if (data.branchId) {
      const branch = await this.brancheRepository.findOne({
        where: { id: data.branchId, restaurant: { id: restaurantId } },
      });
      if (!branch)
        throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
    }
    const category = await this.menuCategoryRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: { restaurant: true, branch: true },
    });
    if (!category)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    if (data.branchId !== undefined)
      category.branch = data.branchId ? ({ id: data.branchId } as any) : null;
    if (data.name !== undefined) category.name = data.name;
    if (data.description !== undefined) category.description = data.description;
    if (data.sortOrder !== undefined) category.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) category.isActive = data.isActive;

    await this.menuCategoryRepository.save(category);
  }

  /**
   * Delete menu category
   */
  async deleteByRestaurant(id: number, restaurantId: number): Promise<void> {
    const result = await this.menuCategoryRepository
      .createQueryBuilder()
      .delete()
      .from(MenuCategoryEntity)
      .where('id = :id', { id })
      .andWhere('restaurant_id = :restaurantId', { restaurantId })
      .execute();
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }
}
