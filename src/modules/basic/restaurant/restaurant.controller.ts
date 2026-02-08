import {
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
import { Roles } from '~/modules/auth/auth.constant';
import { RoleAccess } from '~/modules/auth/decorators/permission.decorator';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';
import { RbacGuard } from '~/modules/auth/guards/rbac.guard';
import { ResourceGuard } from '~/modules/auth/guards/resource.guard';
import {
  RestaurantDto,
  RestaurantQueryDto,
  RestaurantUpdateDto,
} from './restaurant.dto';
import { RestaurantService } from './restaurant.service';

@ApiTags('Basic - Restaurant Module')
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RbacGuard)
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  @ApiOperation({ summary: 'Get Restaurant List' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async list(@Query() dto: RestaurantQueryDto) {
    return this.restaurantService.list(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Restaurant Info' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async info(@IdParam() id: number) {
    return this.restaurantService.info(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Restaurant' })
  async create(@Body() dto: RestaurantDto): Promise<void> {
    await this.restaurantService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Restaurant' })
  async update(
    @IdParam() id: number,
    @Body() dto: RestaurantUpdateDto,
  ): Promise<void> {
    await this.restaurantService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Restaurant' })
  async delete(@IdParam() id: number): Promise<void> {
    await this.restaurantService.delete(id);
  }
}
