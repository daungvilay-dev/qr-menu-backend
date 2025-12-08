import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { IdParam } from '~/common/decorators/id-param.decorator';
import { UserPasswordDto } from './dto/password.dto';
import { UserDto, UserUpdateDto } from './dto/user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@ApiTags('System - User Module')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get user list' })
  async list(@Query() dto: UserUpdateDto) {
    return this.userService.list(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  async read(@IdParam() id: number) {
    return this.userService.info(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() dto: UserDto): Promise<void> {
    return await this.userService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @IdParam() id: number,
    @Body() dto: UserUpdateDto,
  ): Promise<void> {
    return await this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({
    name: 'id',
    type: String,
    schema: { oneOf: [{ type: 'string' }, { type: 'number' }] },
  })
  async delete(
    @Param('id', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
  ): Promise<void> {
    await this.userService.delete(ids);
  }

  @Post(':id/password')
  @ApiOperation({ summary: 'Change user password' })
  async password(
    @IdParam() id: number,
    @Body() dto: UserPasswordDto,
  ): Promise<void> {
    console.log('id', id);
    await this.userService.forceUpdatePassword(id, dto.password);
  }
}
