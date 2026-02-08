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
@ApiTags('Basic - Branch Module')
@UseGuards(JwtAuthGuard)
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
  async list(@AuthUser() user: IAuthUser, @Query() dto: BrancheQueryDto) {
    return this.brancheService.listByRestaurant(this.getRestaurantId(user), dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Branch Info' })
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.brancheService.infoByRestaurant(id, this.getRestaurantId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create Branch' })
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: BrancheDto,
  ): Promise<void> {
    await this.brancheService.createByRestaurant(this.getRestaurantId(user), dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Branch' })
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
  async delete(@AuthUser() user: IAuthUser, @IdParam() id: number): Promise<void> {
    await this.brancheService.deleteByRestaurant(id, this.getRestaurantId(user));
  }
}
