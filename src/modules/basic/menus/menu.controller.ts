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

import { MenuDto, MenuQueryDto, MenuUpdateDto } from './menu.dto';
import { MenuService } from './menu.service';

@ApiTags('Basic - Menu Module')
@Controller('menus')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private menuService: MenuService) {}

  private getRestaurantId(user: IAuthUser): number {
    if (!user.restaurantId)
      throw new BadRequestException('Current user has no restaurant');
    return user.restaurantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get Menu List' })
  async list(@AuthUser() user: IAuthUser, @Query() dto: MenuQueryDto) {
    return this.menuService.list(this.getRestaurantId(user), dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Menu Info' })
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.menuService.info(id, this.getRestaurantId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create Menu' })
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: MenuDto,
  ): Promise<{ menuId: number }> {
    return this.menuService.create(this.getRestaurantId(user), dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Menu' })
  async update(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
    @Body() dto: MenuUpdateDto,
  ): Promise<void> {
    await this.menuService.update(
      id,
      this.getRestaurantId(user),
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Menu' })
  async delete(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
  ): Promise<void> {
    await this.menuService.delete(id, this.getRestaurantId(user));
  }
}
