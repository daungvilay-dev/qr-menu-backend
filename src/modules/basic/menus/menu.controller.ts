import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { IdParam } from '~/common/decorators/id-param.decorator';
import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';

import { MenuDto, MenuQueryDto, MenuUpdateDto } from './menu.dto';
import { MenuService } from './menu.service';
import { RbacGuard } from '~/modules/auth/guards/rbac.guard';
import { RoleAccess } from '~/modules/auth/decorators/permission.decorator';
import { Roles } from '~/modules/auth/auth.constant';

const MENU_UPLOAD_DIR = join(process.cwd(), 'uploads', 'menus');
const { diskStorage } = require('multer');

type UploadedImageFile = {
  filename: string;
  mimetype: string;
  originalname: string;
};

const ensureMenuUploadDir = () => {
  if (!existsSync(MENU_UPLOAD_DIR)) mkdirSync(MENU_UPLOAD_DIR, { recursive: true });
};

const imageFileFilter = (
  _req: unknown,
  file: UploadedImageFile,
  cb: (error: any, acceptFile: boolean) => void,
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }
  cb(new BadRequestException('Only image files are allowed'), false);
};

@ApiTags('Basic - Menu Module')
@Controller('menus')
@UseGuards(JwtAuthGuard, RbacGuard)
export class MenuController {
  constructor(private menuService: MenuService) {}

  private buildImagePath(filename: string): string {
    return `/uploads/menus/${filename}`;
  }

  private getRestaurantId(user: IAuthUser): number {
    if (!user.restaurantId)
      throw new BadRequestException('Current user has no restaurant');
    return user.restaurantId;
  }

  @Get()
  @ApiOperation({ summary: 'Get Menu List' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async list(@AuthUser() user: IAuthUser, @Query() dto: MenuQueryDto) {
    return this.menuService.list(this.getRestaurantId(user), dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Menu Info' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.menuService.info(id, this.getRestaurantId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create Menu' })
  @ApiConsumes('multipart/form-data')
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureMenuUploadDir();
          cb(null, MENU_UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${randomUUID().replace(/-/g, '').slice(0, 8)}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @AuthUser() user: IAuthUser,
    @Body() dto: MenuDto,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<{ menuId: number }> {
    if (file) dto.img = this.buildImagePath(file.filename);
    return this.menuService.create(this.getRestaurantId(user), dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Menu' })
  @ApiConsumes('multipart/form-data')
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureMenuUploadDir();
          cb(null, MENU_UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${randomUUID().replace(/-/g, '').slice(0, 8)}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async update(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
    @Body() dto: MenuUpdateDto,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<void> {
    if (file) dto.img = this.buildImagePath(file.filename);
    await this.menuService.update(id, this.getRestaurantId(user), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Menu' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
  ])
  async delete(
    @AuthUser() user: IAuthUser,
    @IdParam() id: number,
  ): Promise<void> {
    await this.menuService.delete(id, this.getRestaurantId(user));
  }
}
