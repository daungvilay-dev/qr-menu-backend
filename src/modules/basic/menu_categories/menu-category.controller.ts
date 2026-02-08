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

import {
  MenuCategoryDto,
  MenuCategoryQueryDto,
  MenuCategoryUpdateDto,
} from './menu-category.dto';
import { MenuCategoryService } from './menu-category.service';

@ApiTags('Basic - Menu Category Module')
@Controller('menu-categories')
@UseGuards(JwtAuthGuard)
export class MenuCategoryController {
  constructor(private menuCategoryService: MenuCategoryService) {}

  private getRestaurantId(user: IAuthUser): number {
    if (!user.restaurantId)
      throw new BadRequestException('Current user has no restaurant');
    return user.restaurantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get Menu Category List' })
  async list(@AuthUser() user: IAuthUser, @Query() dto: MenuCategoryQueryDto) {
    return this.menuCategoryService.listByRestaurant(
      this.getRestaurantId(user),
      dto,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Menu Category Info' })
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.menuCategoryService.infoByRestaurant(
      id,
      this.getRestaurantId(user),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create Menu Category' })
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: MenuCategoryDto,
  ): Promise<{ categoryId: number }> {
    return this.menuCategoryService.createByRestaurant(
      this.getRestaurantId(user),
      dto,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Menu Category' })
  async update(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
    @Body() dto: MenuCategoryUpdateDto,
  ): Promise<void> {
    await this.menuCategoryService.updateByRestaurant(
      id,
      this.getRestaurantId(user),
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Menu Category' })
  async delete(@AuthUser() user: IAuthUser, @IdParam() id: number): Promise<void> {
    await this.menuCategoryService.deleteByRestaurant(id, this.getRestaurantId(user));
  }
}
