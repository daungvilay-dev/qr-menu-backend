import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from '~/common/decorators/api-result.decorator';
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

@ApiTags('Auth - Authentication module')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private restaurantService: RestaurantService,
  ) {}

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
  async registerRestaurant(
    @Body() dto: RegisterRestaurantByUserIdDto,
  ): Promise<{ restaurantId: number }> {
    const { userId, ...data } = dto;
    return this.restaurantService.registerByOwner(userId, data);
  }
}
