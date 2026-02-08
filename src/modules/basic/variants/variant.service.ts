import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Like, Repository } from 'typeorm';

import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';

import { VariantDto, VariantQueryDto, VariantUpdateDto } from './variant.dto';
import { VariantEntity } from './variant.entity';

@Injectable()
export class VariantService {
  constructor(
    @InjectRepository(VariantEntity)
    private variantRepository: Repository<VariantEntity>,
  ) {}

  /**
   * Query variant list
   */
  async list({
    page,
    limit,
    menuId,
    name,
    isActive,
  }: VariantQueryDto): Promise<Pagination<VariantEntity>> {
    const queryBuilder = this.variantRepository
      .createQueryBuilder('variant')
      .leftJoin('variant.menu', 'menu')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(!isNil(isActive) ? { isActive } : null),
      });
    if (menuId) queryBuilder.andWhere('menu.id = :menuId', { menuId });

    return paginate<VariantEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get variant information by ID
   */
  async info(id: number) {
    const info = await this.variantRepository.findOne({
      where: { id },
    });

    return { ...info };
  }

  /**
   * Add variant
   */
  async create({ menuId, ...data }: VariantDto): Promise<{ variantId: number }> {
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
    { menuId, ...data }: VariantUpdateDto,
  ): Promise<void> {
    const variant = await this.variantRepository.findOne({
      where: { id },
      relations: { menu: true },
    });
    if (!variant) return;

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
  async delete(id: number): Promise<void> {
    await this.variantRepository.delete(id);
  }
}
