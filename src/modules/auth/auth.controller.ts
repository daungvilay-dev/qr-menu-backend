import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResult } from '~/common/decorators/api-result.decorator';
import { UserService } from '~/modules/system/user/user.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { LocalGuard } from './guards/local.guard';
import { AuthTokens } from './models/auth.model';

@ApiTags('Auth - Authentication module')
@UseGuards(LocalGuard)
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in' })
  @ApiResult({ type: AuthTokens })
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') ua: string,
  ): Promise<AuthTokens> {
    // If it is not a development environment, verify the picture verification code
    const token = await this.authService.login(dto.username, dto.password);
    return token;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiResult({ type: AuthTokens })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('register')
  @ApiOperation({ summary: 'register' })
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.userService.register(dto);
  }
}
