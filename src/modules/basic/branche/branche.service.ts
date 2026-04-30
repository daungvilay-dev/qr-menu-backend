import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Like, Repository } from 'typeorm';

import { ErrorEnum } from '~/common/constants/error-code.constant';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';

import { BrancheDto, BrancheQueryDto, BrancheUpdateDto } from './branche.dto';
import { BrancheEntity } from './branche.entity';

@Injectable()
export class BrancheService {
  constructor(
    @InjectRepository(BrancheEntity)
    private brancheRepository: Repository<BrancheEntity>,
  ) {}

  /**
   * Query branch list
   */
  async listByRestaurant(
    restaurantId: number,
    { page, limit, name, slug, isActive }: BrancheQueryDto,
  ): Promise<Pagination<BrancheEntity>> {
    const queryBuilder = this.brancheRepository
      .createQueryBuilder('branche')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(slug ? { slug: Like(`%${slug}%`) } : null),
        ...(!isNil(isActive) ? { isActive } : null),
        restaurant: { id: restaurantId },
      });

    return paginate<BrancheEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get branch information by ID
   */
  async infoByRestaurant(id: number, restaurantId: number) {
    const info = await this.brancheRepository.findOne({
      where: { id, restaurant: { id: restaurantId } },
    });
    if (!info)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    return { ...info };
  }

  /**
   * Add branch
   */
  async createByRestaurant(
    restaurantId: number,
    { ...data }: BrancheDto,
  ): Promise<{ brancheId: number }> {
    if (!restaurantId)
      throw new BadRequestException('Restaurant ID is required');

    console.log({
      ...data,
      restaurant: { id: restaurantId } as any,
    });
    const branche = await this.brancheRepository.save({
      ...data,
      restaurant: { id: restaurantId } as any,
    });

    return { brancheId: branche.id };
  }

  /**
   * Update branch information
   */
  async updateByRestaurant(
    id: number,
    restaurantId: number,
    { ...data }: BrancheUpdateDto,
  ): Promise<void> {
    const result = await this.brancheRepository.update(
      { id, restaurant: { id: restaurantId } },
      data,
    );
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }

  /**
   * Delete branch
   */
  async deleteByRestaurant(id: number, restaurantId: number): Promise<void> {
    const result = await this.brancheRepository.delete({
      id,
      restaurant: { id: restaurantId },
    });
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }
}
