import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isNil } from 'lodash';
import { Like, Repository } from 'typeorm';

import { paginate } from '~/helper/paginate';
import { Pagination } from '~/helper/paginate/pagination';
import { BusinessException } from '~/common/exceptions/biz.exception';
import { ErrorEnum } from '~/common/constants/error-code.constant';

import {
  RestaurantDto,
  RestaurantQueryDto,
  RestaurantUpdateDto,
} from './restaurant.dto';
import { RestaurantEntity } from './restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private restaurantRepository: Repository<RestaurantEntity>,
  ) {}

  private async saveRestaurant(
    data: Omit<RestaurantDto, 'createBy' | 'updateBy'>,
  ): Promise<{ restaurantId: number }> {
    const restaurant = await this.restaurantRepository.save({
      ...data,
    });

    return { restaurantId: restaurant.id };
  }

  /**
   * Query restaurant list
   */
  async list({
    page,
    limit,
    name,
    slug,
    isActive,
  }: RestaurantQueryDto,
  ownerId?: number,
  ): Promise<Pagination<RestaurantEntity>> {
    const queryBuilder = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .where({
        ...(name ? { name: Like(`%${name}%`) } : null),
        ...(slug ? { slug: Like(`%${slug}%`) } : null),
        ...(!isNil(isActive) ? { isActive } : null),
        ...(ownerId ? { ownerId } : null),
      });

    return paginate<RestaurantEntity>(queryBuilder, {
      page,
      limit,
    });
  }

  /**
   * Get restaurant information by ID
   */
  async info(id: number, ownerId?: number) {
    const info = await this.restaurantRepository.findOne({
      where: { id, ...(ownerId ? { ownerId } : null) },
      relations: { owner: true, branches: true },
    });

    if (!info)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    return { ...info };
  }

  /**
   * Add restaurant
   */
  async create({ ...data }: RestaurantDto): Promise<{ restaurantId: number }> {
    const { name, slug, contactEmail, phone, logo, isActive, ownerId } = data;
    return this.saveRestaurant({
      name,
      slug,
      contactEmail,
      phone,
      logo,
      isActive,
      ownerId,
    });
  }

  /**
   * Register restaurant (public flow)
   */
  async registerByOwner(
    ownerId: number,
    data: Pick<
      RestaurantDto,
      'name' | 'slug' | 'contactEmail' | 'phone' | 'logo'
    > & { logoUrl?: string },
  ): Promise<{ restaurantId: number }> {
    const exists = await this.restaurantRepository.findOne({
      where: { slug: data.slug },
    });
    if (exists) throw new BadRequestException('Restaurant slug already exists');

    const ownerRestaurant = await this.restaurantRepository.findOne({
      where: {
        owner: {
          id: ownerId,
        },
      },
    });
    if (ownerRestaurant)
      throw new BadRequestException('Owner already has a restaurant');

    return this.saveRestaurant({
      ...data,
      logo: data.logo ?? data.logoUrl,
      isActive: true,
      ownerId,
    });
  }

  async myRestaurant(ownerId: number): Promise<RestaurantEntity> {
    const restaurant = await this.restaurantRepository.findOne({
      where: {
        owner: {
          id: ownerId,
        },
      },
      relations: { owner: true, branches: true },
    });
    if (!restaurant)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
    return restaurant;
  }

  async findRestaurantIdByOwner(ownerId: number): Promise<number | null> {
    const restaurant = await this.restaurantRepository.findOne({
      where: {
        owner: {
          id: ownerId,
        },
      },
      select: ['id'],
    });
    return restaurant?.id ?? null;
  }

  /**
   * Update restaurant information
   */
  async update(
    id: number,
    { ...data }: RestaurantUpdateDto,
    ownerId?: number,
  ): Promise<void> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, ...(ownerId ? { ownerId } : null) },
    });
    if (!restaurant)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);

    await this.restaurantRepository.update(id, data);
  }

  /**
   * Delete restaurant
   */
  async delete(id: number, ownerId?: number): Promise<void> {
    const result = await this.restaurantRepository.delete({
      id,
      ...(ownerId ? { ownerId } : null),
    });
    if (!result.affected)
      throw new BusinessException(ErrorEnum.REQUESTED_RESOURCE_NOT_FOUND);
  }
}
