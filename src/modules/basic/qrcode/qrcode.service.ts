import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';

import { ErrorEnum } from '~/common/constants/error-code.constant';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';
import { MenuCategoryEntity } from '../menu_categories/menu-category.entity';
import { MenuEntity } from '../menus/menu.entity';

import { QrcodeDto, QrcodeQueryDto, QrcodeUpdateDto } from './qrcode.dto';
import { QrcodeEntity } from './qrcode.entity';

@Injectable()
export class QrcodeService {
  constructor(
    @InjectRepository(QrcodeEntity)
    private qrcodeRepository: Repository<QrcodeEntity>,
    @InjectRepository(MenuCategoryEntity)
    private menuCategoryRepository: Repository<MenuCategoryEntity>,
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
  ) {}

  /**
   * Query QR code list
   */
  async listByRestaurant(
    restaurantId: number,
    { page, limit, branchId, tableNumber, table_number }: QrcodeQueryDto,
  ): Promise<Pagination<QrcodeEntity>> {
    const resolvedTableNumber = tableNumber ?? table_number;
    const queryBuilder = this.qrcodeRepository
      .createQueryBuilder('qrcode')
      .leftJoinAndSelect('qrcode.restaurant', 'restaurant')
      .leftJoinAndSelect('qrcode.branch', 'branch')
      .where('restaurant.id = :restaurantId', { restaurantId });

    if (branchId)
      queryBuilder.andWhere('qrcode.branch_id = :branchId', { branchId });
    if (resolvedTableNumber)
      queryBuilder.andWhere('qrcode.table_number LIKE :tableNumber', {
        tableNumber: `%${resolvedTableNumber}%`,
      });

    return paginate<QrcodeEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get QR code information by ID
   */
  async infoByRestaurant(id: number, restaurantId: number) {
    const info = await this.qrcodeRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: {
        branch: true,
        restaurant: true,
      },
    });
    if (!info)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    return { ...info };
  }

  /**
   * Add QR code
   */
  async createByRestaurant(
    restaurantId: number,
    { branchId, tableNumber, table_number }: QrcodeDto,
  ): Promise<{ qrcodeId: number; qrcodeUuid: string }> {
    if (!restaurantId)
      throw new BadRequestException('Restaurant ID is required');

    const resolvedTableNumber = tableNumber ?? table_number;
    const qrcode = await this.qrcodeRepository.save({
      restaurant: { id: restaurantId } as any,
      ...(branchId !== undefined
        ? { branch: branchId ? ({ id: branchId } as any) : null }
        : null),
      tableNumber: resolvedTableNumber,
    });

    return { qrcodeId: qrcode.id, qrcodeUuid: qrcode.uuid };
  }

  /**
   * Update QR code information
   */
  async updateByRestaurant(
    id: number,
    restaurantId: number,
    { branchId, tableNumber, table_number }: QrcodeUpdateDto,
  ): Promise<void> {
    const resolvedTableNumber = tableNumber ?? table_number;
    const qrcode = await this.qrcodeRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
      relations: { restaurant: true, branch: true },
    });
    if (!qrcode)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    if (branchId !== undefined)
      qrcode.branch = branchId ? ({ id: branchId } as any) : null;
    if (resolvedTableNumber !== undefined)
      qrcode.tableNumber = resolvedTableNumber;

    await this.qrcodeRepository.save(qrcode);
  }

  /**
   * Delete QR code
   */
  async deleteByRestaurant(id: number, restaurantId: number): Promise<void> {
    const result = await this.qrcodeRepository
      .createQueryBuilder()
      .delete()
      .from(QrcodeEntity)
      .where('id = :id', { id })
      .andWhere('restaurant_id = :restaurantId', { restaurantId })
      .execute();
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }

  async scanByUuid(uuid: string) {
    const qrcode = await this.qrcodeRepository.findOne({
      where: { uuid },
      relations: {
        restaurant: true,
        branch: true,
      },
    });
    if (!qrcode)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    await this.qrcodeRepository.increment({ id: qrcode.id }, 'scanCount', 1);
    const now = new Date();
    await this.qrcodeRepository.update(qrcode.id, { lastScannedAt: now });

    const restaurantId = qrcode.restaurant?.id;
    if (!restaurantId)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    const categoryQuery = this.menuCategoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.restaurant', 'restaurant')
      .where('restaurant.id = :restaurantId', { restaurantId })
      .andWhere('category.is_active = :isActive', { isActive: true })
      .orderBy('category.sort_order', 'ASC')
      .addOrderBy('category.id', 'ASC');

    // console.log(categoryQuery);
    console.log(qrcode.branch?.id);

    if (qrcode.branch?.id)
      categoryQuery
        .leftJoin('category.branch', 'branch')
        .andWhere('branch.id = :branchId', { branchId: qrcode.branch.id });

    const categories = await categoryQuery.getMany();

    const categoryIds = categories.map((c) => c.id);
    const menuQuery = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.category', 'category')
      .leftJoin('menu.restaurant', 'restaurant')
      .where('restaurant.id = :restaurantId', { restaurantId })
      .andWhere('menu.is_available = :isAvailable', { isAvailable: true })
      .orderBy('menu.sort_order', 'ASC')
      .addOrderBy('menu.id', 'ASC');

    if (categoryIds.length)
      menuQuery.andWhere('category.id IN (:...categoryIds)', { categoryIds });
    else menuQuery.andWhere('1 = 0');

    const menus = await menuQuery.getMany();

    // console.log(menus);

    const menuMap = new Map<number, MenuEntity[]>();
    menus.forEach((menu) => {
      const categoryId = menu.category?.id;
      if (!categoryId) return;
      const items = menuMap.get(categoryId) ?? [];
      items.push(menu);
      menuMap.set(categoryId, items);
    });

    return {
      qrcode: {
        id: qrcode.id,
        uuid: qrcode.uuid,
        tableNumber: qrcode.tableNumber,
        scanCount: qrcode.scanCount + 1,
        lastScannedAt: now,
      },
      restaurant: qrcode.restaurant,
      branch: qrcode.branch ?? null,
      items: {
        categories: categories.map((category) => ({
          ...category,
          menus: menuMap.get(category.id) ?? [],
        })),
      },
    };
  }
}
