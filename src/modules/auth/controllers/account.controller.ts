import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

import { ApiResult } from '~/common/decorators/api-result.decorator';

import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator';
import { AllowAnon } from '~/modules/auth/decorators/allow-anon.decorator';
import { AuthUser } from '~/modules/auth/decorators/auth-user.decorator';

import { PasswordUpdateDto } from '~/modules/system/user/dto/password.dto';

import { AccountInfo } from '~/modules/system/user/user.model';
import { UserService } from '~/modules/system/user/user.service';
import { AuthService } from '../auth.service';
import { RegisterRestaurantDto } from '../dto/auth.dto';
import { AccountUpdateDto } from '../dto/account.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RestaurantService } from '~/modules/basic/restaurant/restaurant.service';

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

@ApiTags('Account - Account Module')
@ApiSecurityAuth()
@ApiExtraModels(AccountInfo)
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private restaurantService: RestaurantService,
  ) {}

  private buildLogoPath(filename: string): string {
    return `/uploads/restaurants/${filename}`;
  }

  private normalizeLogoInput(
    dto: RegisterRestaurantDto,
    file?: UploadedImageFile,
  ): void {
    if (file) {
      dto.logo = this.buildLogoPath(file.filename);
      dto.logoUrl = dto.logo;
      return;
    }

    if (dto.logoUrl && !dto.logo) dto.logo = dto.logoUrl;
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get account information' })
  @ApiResult({ type: AccountInfo })
  @AllowAnon()
  async profile(@AuthUser() user: IAuthUser): Promise<AccountInfo> {
    console.log(user);
    return this.userService.getAccountInfo(user.uid);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Account Logout' })
  @AllowAnon()
  async logout(
    @AuthUser() user: IAuthUser,
    @Req() req: FastifyRequest,
  ): Promise<void> {
    await this.authService.clearLoginStatus(user, req.accessToken);
  }

  // @Get('permissions')
  // @ApiOperation({ summary: 'Get permission list' })
  // @ApiResult({ type: [String] })
  // @AllowAnon()
  // async permissions(@AuthUser() user: IAuthUser): Promise<string[]> {
  //   return this.authService.getPermissions(user.uid);
  // }

  @Put('update')
  @ApiOperation({ summary: 'Change Account Details' })
  @AllowAnon()
  async update(
    @AuthUser() user: IAuthUser,
    @Body()
    dto: AccountUpdateDto,
  ): Promise<void> {
    await this.userService.updateAccountInfo(user.uid, dto);
  }

  @Post('password')
  @ApiOperation({ summary: 'Change account password' })
  @AllowAnon()
  async password(
    @AuthUser() user: IAuthUser,
    @Body()
    dto: PasswordUpdateDto,
  ): Promise<void> {
    await this.userService.updatePassword(user.uid, dto);
  }

  @Post('restaurant/register')
  @ApiOperation({ summary: 'Register restaurant for current user' })
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
  async registerRestaurant(
    @AuthUser() user: IAuthUser,
    @Body() dto: RegisterRestaurantDto,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<{ restaurantId: number }> {
    this.normalizeLogoInput(dto, file);
    return this.restaurantService.registerByOwner(user.uid, dto);
  }

  @Get('restaurant')
  @ApiOperation({ summary: 'Get current user restaurant info' })
  async restaurant(@AuthUser() user: IAuthUser) {
    return this.restaurantService.myRestaurant(user.uid);
  }
}
