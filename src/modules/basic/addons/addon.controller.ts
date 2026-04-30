import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdParam } from '~/common/decorators/id-param.decorator';
import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';

import { AddonDto, AddonQueryDto, AddonUpdateDto } from './addon.dto';
import { AddonService } from './addon.service';
import { RbacGuard } from '~/modules/auth/guards/rbac.guard';
import { RoleAccess } from '~/modules/auth/decorators/permission.decorator';
import { Roles } from '~/modules/auth/auth.constant';

@ApiTags('Basic - Addon Module')
@Controller('addons')
@UseGuards(JwtAuthGuard)
export class AddonController {
  constructor(private addonService: AddonService) {}

  private getRestaurantId(user: IAuthUser): number {
    if (!user.restaurantId)
      throw new BadRequestException('Current user has no restaurant');
    return user.restaurantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get Addon List' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async list(@AuthUser() user: IAuthUser, @Query() dto: AddonQueryDto) {
    return this.addonService.listByRestaurant(this.getRestaurantId(user), dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Addon Info' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.addonService.infoByRestaurant(id, this.getRestaurantId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create Addon' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: AddonDto,
  ): Promise<{ addonId: number }> {
    return this.addonService.createByRestaurant(
      this.getRestaurantId(user),
      dto,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Addon' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async update(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
    @Body() dto: AddonUpdateDto,
  ): Promise<void> {
    await this.addonService.updateByRestaurant(
      id,
      this.getRestaurantId(user),
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Addon' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async delete(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
  ): Promise<void> {
    await this.addonService.deleteByRestaurant(id, this.getRestaurantId(user));
  }
}
