import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from '~/common/decorators/api-result.decorator';
import { randomUUID } from 'crypto';
import { RestaurantService } from '~/modules/basic/restaurant/restaurant.service';
import { UserService } from '~/modules/system/user/user.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  RegisterRestaurantByUserIdDto,
} from './dto/auth.dto';
import { AuthTokens } from './models/auth.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

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

@ApiTags('Auth - Authentication module')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private restaurantService: RestaurantService,
  ) {}

  private buildLogoPath(filename: string): string {
    return `/uploads/restaurants/${filename}`;
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in' })
  @ApiResult({ type: AuthTokens })
  async login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return await this.authService.login(dto.username, dto.password);
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResult({ type: AuthTokens })
  async refresh(@Query() q: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(q.token);
  }

  @Post('register')
  @ApiOperation({ summary: 'register' })
  async register(@Body() dto: RegisterDto): Promise<{ userId: number }> {
    return this.userService.register(dto);
  }

  @Post('register/restaurant')
  @ApiOperation({ summary: 'Register restaurant' })
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
    @Body() dto: RegisterRestaurantByUserIdDto,
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<{ restaurantId: number }> {
    if (file) {
      dto.logo = this.buildLogoPath(file.filename);
      dto.logoUrl = dto.logo;
    }
    const { userId, ...data } = dto;
    return this.restaurantService.registerByOwner(userId, data);
  }
}
