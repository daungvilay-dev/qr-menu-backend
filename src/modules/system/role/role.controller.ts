import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdParam } from '~/common/decorators/id-param.decorator';
import { UpdaterPipe } from '~/common/pipes/updater.pipe';

import { RoleEntity } from '~/modules/system/role/role.entity';

import { RoleDto, RoleQueryDto, RoleUpdateDto } from './role.dto';
import { RoleInfo } from './role.model';
import { RoleService } from './role.service';

@ApiTags('System - Role Module')
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Get Role List' })
  async list(@Query() dto: RoleQueryDto) {
    return this.roleService.list(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Role Info' })
  async info(@IdParam() id: number) {
    return this.roleService.info(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create Role' })
  async create(@Body() dto: RoleDto): Promise<void> {
    await this.roleService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Role' })
  async update(
    @IdParam() id: number,
    @Body(UpdaterPipe) dto: RoleUpdateDto,
  ): Promise<void> {
    await this.roleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Role' })
  async delete(@IdParam() id: number): Promise<void> {
    if (await this.roleService.checkUserByRoleId(id))
      throw new BadRequestException(
        'This role has associated users and cannot be deleted',
      );

    await this.roleService.delete(id);
  }
}
