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
import { BrancheDto, BrancheQueryDto, BrancheUpdateDto } from './branche.dto';
import { BrancheService } from './branche.service';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';
import { RbacGuard } from '~/modules/auth/guards/rbac.guard';
import { RoleAccess } from '~/modules/auth/decorators/permission.decorator';
import { Roles } from '~/modules/auth/auth.constant';
@ApiTags('Basic - Branch Module')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('branches')
export class BrancheController {
  constructor(private brancheService: BrancheService) {}

  private getRestaurantId(user: IAuthUser): number {
    if (!user.restaurantId)
      throw new BadRequestException('Current user has no restaurant');
    return user.restaurantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get Branch List' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
  ])
  async list(@AuthUser() user: IAuthUser, @Query() dto: BrancheQueryDto) {
    return this.brancheService.listByRestaurant(
      this.getRestaurantId(user),
      dto,
    );
  }

  @Get(':id')
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
  ])
  @ApiOperation({ summary: 'Get Branch Info' })
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.brancheService.infoByRestaurant(id, this.getRestaurantId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create Branch' })
  @RoleAccess([Roles.SUPER_ADMIN, Roles.RESTAURANT_OWNER])
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: BrancheDto,
  ): Promise<void> {
    await this.brancheService.createByRestaurant(
      this.getRestaurantId(user),
      dto,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Branch' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async update(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
    @Body() dto: BrancheUpdateDto,
  ): Promise<void> {
    await this.brancheService.updateByRestaurant(
      id,
      this.getRestaurantId(user),
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Branch' })
  @RoleAccess([Roles.SUPER_ADMIN, Roles.RESTAURANT_OWNER])
  async delete(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
  ): Promise<void> {
    await this.brancheService.deleteByRestaurant(
      id,
      this.getRestaurantId(user),
    );
  }
}
