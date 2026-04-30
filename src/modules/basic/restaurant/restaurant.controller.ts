import {
  Body,
  BadRequestException,
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
import { Roles } from '~/modules/auth/auth.constant';
import { RoleAccess } from '~/modules/auth/decorators/permission.decorator';
import { JwtAuthGuard } from '~/modules/auth/guards/jwt-auth.guard';
import { RbacGuard } from '~/modules/auth/guards/rbac.guard';
import {
  RestaurantDto,
  RestaurantQueryDto,
  RestaurantUpdateDto,
} from './restaurant.dto';
import { RestaurantService } from './restaurant.service';

const RESTAURANT_UPLOAD_DIR = join(process.cwd(), 'uploads', 'restaurants');
const { diskStorage } = require('multer');

type UploadedImageFile = {
  filename: string;
  mimetype: string;
  originalname: string;
};

const ensureRestaurantUploadDir = () => {
  if (!existsSync(RESTAURANT_UPLOAD_DIR))
    mkdirSync(RESTAURANT_UPLOAD_DIR, { recursive: true });
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

@ApiTags('Basic - Restaurant Module')
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RbacGuard)
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  private buildLogoPath(filename: string): string {
    return `/uploads/restaurants/${filename}`;
  }

  private normalizeLogoInput(
    dto: RestaurantDto | RestaurantUpdateDto,
    file?: UploadedImageFile,
  ): void {
    if (file) {
      dto.logo = this.buildLogoPath(file.filename);
      return;
    }

    if ('logoUrl' in dto && dto.logoUrl) dto.logo = dto.logoUrl;
  }

  private isSuperAdmin(user: IAuthUser): boolean {
    return user.roles?.includes(Roles.SUPER_ADMIN);
  }

  @Get()
  @ApiOperation({ summary: 'Get Restaurant List' })
  @RoleAccess([
    Roles.SUPER_ADMIN,
    Roles.RESTAURANT_OWNER,
    Roles.RESTAURANT_MANAGER,
    Roles.USER,
    Roles.GUEST,
  ])
  async list(@AuthUser() user: IAuthUser, @Query() dto: RestaurantQueryDto) {
    return this.restaurantService.list(
      dto,
      this.isSuperAdmin(user) ? undefined : user.uid,
    );
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
  async info(@AuthUser() user: IAuthUser, @IdParam() id: number) {
    return this.restaurantService.info(
      id,
      this.isSuperAdmin(user) ? undefined : user.uid,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create Restaurant' })
  @RoleAccess([Roles.SUPER_ADMIN, Roles.RESTAURANT_OWNER])
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureRestaurantUploadDir();
          cb(null, RESTAURANT_UPLOAD_DIR);
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
    @Body() dto: RestaurantDto,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<void> {
    this.normalizeLogoInput(dto, file);
    if (!this.isSuperAdmin(user)) dto.ownerId = user.uid;
    await this.restaurantService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Restaurant' })
  @RoleAccess([Roles.SUPER_ADMIN, Roles.RESTAURANT_OWNER])
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureRestaurantUploadDir();
          cb(null, RESTAURANT_UPLOAD_DIR);
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
    @Body() dto: RestaurantUpdateDto,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<void> {
    this.normalizeLogoInput(dto, file);
    await this.restaurantService.update(
      id,
      dto,
      this.isSuperAdmin(user) ? undefined : user.uid,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Restaurant' })
  @RoleAccess([Roles.SUPER_ADMIN, Roles.RESTAURANT_OWNER])
  async delete(@AuthUser() user: IAuthUser, @IdParam() id: number): Promise<void> {
    await this.restaurantService.delete(
      id,
      this.isSuperAdmin(user) ? undefined : user.uid,
    );
  }
}
