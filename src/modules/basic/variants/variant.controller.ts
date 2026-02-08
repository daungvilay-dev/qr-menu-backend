import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdParam } from '~/common/decorators/id-param.decorator';
import { UpdaterPipe } from '~/common/pipes/updater.pipe';

import { VariantDto, VariantQueryDto, VariantUpdateDto } from './variant.dto';
import { VariantService } from './variant.service';

@ApiTags('Basic - Variant Module')
@Controller('variants')
export class VariantController {
  constructor(private variantService: VariantService) {}

  @Get()
  @ApiOperation({ summary: 'Get Variant List' })
  async list(@Query() dto: VariantQueryDto) {
    return this.variantService.list(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Variant Info' })
  async info(@IdParam() id: number) {
    return this.variantService.info(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Variant' })
  async create(@Body() dto: VariantDto): Promise<void> {
    await this.variantService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Variant' })
  async update(
    @IdParam() id: number,
    @Body(UpdaterPipe) dto: VariantUpdateDto,
  ): Promise<void> {
    await this.variantService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Variant' })
  async delete(@IdParam() id: number): Promise<void> {
    await this.variantService.delete(id);
  }
}
