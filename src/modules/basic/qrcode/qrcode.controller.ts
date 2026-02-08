import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdParam } from '~/common/decorators/id-param.decorator';
import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator';
import { Public } from '~/modules/auth/decorators/public.decorator';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';

import { QrcodeDto, QrcodeQueryDto, QrcodeUpdateDto } from './qrcode.dto';
import { QrcodeService } from './qrcode.service';

@ApiTags('Basic - QR Code Module')
@Controller('qrcodes')
@UseGuards(JwtAuthGuard)
export class QrcodeController {
  constructor(private qrcodeService: QrcodeService) {}

  private getRestaurantId(user: IAuthUser): number {
    if (!user.restaurantId)
      throw new BadRequestException('Current user has no restaurant');
    return user.restaurantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get QR Code List' })
  async list(@AuthUser() user: IAuthUser, @Query() dto: QrcodeQueryDto) {
    return this.qrcodeService.listByRestaurant(this.getRestaurantId(user), dto);
  }

  @Get('scan/:uuid')
  @Public()
  @ApiOperation({ summary: 'Scan QR by UUID and get menu theme' })
  async scan(@Param('uuid', new ParseUUIDPipe()) uuid: string) {
    return this.qrcodeService.scanByUuid(uuid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get QR Code Info' })
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.qrcodeService.infoByRestaurant(id, this.getRestaurantId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create QR Code' })
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: QrcodeDto,
  ): Promise<{ qrcodeId: number; qrcodeUuid: string }> {
    return this.qrcodeService.createByRestaurant(
      this.getRestaurantId(user),
      dto,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update QR Code' })
  async update(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
    @Body() dto: QrcodeUpdateDto,
  ): Promise<void> {
    await this.qrcodeService.updateByRestaurant(
      id,
      this.getRestaurantId(user),
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete QR Code' })
  async delete(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
  ): Promise<void> {
    await this.qrcodeService.deleteByRestaurant(id, this.getRestaurantId(user));
  }
}
