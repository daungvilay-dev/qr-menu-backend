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
import { UpdaterPipe } from '~/common/pipes/updater.pipe';
import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator';

import { VariantDto, VariantQueryDto, VariantUpdateDto } from './variant.dto';
import { VariantService } from './variant.service';
import { RbacGuard } from '~/modules/auth/guards/rbac.guard';
import { RoleAccess } from '~/modules/auth/decorators/permission.decorator';
import { Roles } from '~/modules/auth/auth.constant';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';

@ApiTags('Basic - Variant Module')
@Controller('variants')
@UseGuards(JwtAuthGuard, RbacGuard)
export class VariantController {
  constructor(private variantService: VariantService) {}

  private getRestaurantId(user: IAuthUser): number {
    if (!user.restaurantId)
      throw new BadRequestException('Current user has no restaurant');
    return user.restaurantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get Variant List' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async list(@AuthUser() user: IAuthUser, @Query() dto: VariantQueryDto) {
    return this.variantService.list(this.getRestaurantId(user), dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Variant Info' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.variantService.info(id, this.getRestaurantId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create Variant' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: VariantDto,
  ): Promise<void> {
    await this.variantService.create(this.getRestaurantId(user), dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Variant' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async update(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
    @Body(UpdaterPipe) dto: VariantUpdateDto,
  ): Promise<void> {
    await this.variantService.update(id, this.getRestaurantId(user), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Variant' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async delete(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
  ): Promise<void> {
    await this.variantService.delete(id, this.getRestaurantId(user));
  }
}
