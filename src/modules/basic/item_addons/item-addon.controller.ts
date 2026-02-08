import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdaterPipe } from '~/common/pipes/updater.pipe';

import {
  ItemAddonDto,
  ItemAddonQueryDto,
  ItemAddonUpdateDto,
} from './item-addon.dto';
import { ItemAddonService } from './item-addon.service';

@ApiTags('Basic - Item Addon Module')
@Controller('item-addons')
export class ItemAddonController {
  constructor(private itemAddonService: ItemAddonService) {}

  @Get()
  @ApiOperation({ summary: 'Get Item Addon List' })
  async list(@Query() dto: ItemAddonQueryDto) {
    return this.itemAddonService.list(dto);
  }

  @Get(':itemId/:addonId')
  @ApiOperation({ summary: 'Get Item Addon Info' })
  async info(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('addonId', ParseIntPipe) addonId: number,
  ) {
    return this.itemAddonService.info(itemId, addonId);
  }

  @Post()
  @ApiOperation({ summary: 'Create Item Addon' })
  async create(@Body() dto: ItemAddonDto): Promise<void> {
    await this.itemAddonService.create(dto);
  }

  @Put(':itemId/:addonId')
  @ApiOperation({ summary: 'Update Item Addon' })
  async update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('addonId', ParseIntPipe) addonId: number,
    @Body(UpdaterPipe) dto: ItemAddonUpdateDto,
  ): Promise<void> {
    await this.itemAddonService.update(itemId, addonId, dto);
  }

  @Delete(':itemId/:addonId')
  @ApiOperation({ summary: 'Delete Item Addon' })
  async delete(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('addonId', ParseIntPipe) addonId: number,
  ): Promise<void> {
    await this.itemAddonService.delete(itemId, addonId);
  }
}
