import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

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
  async registerRestaurant(
    @AuthUser() user: IAuthUser,
    @Body() dto: RegisterRestaurantDto,
  ): Promise<{ restaurantId: number }> {
    return this.restaurantService.registerByOwner(user.uid, dto);
  }

  @Get('restaurant')
  @ApiOperation({ summary: 'Get current user restaurant info' })
  async restaurant(@AuthUser() user: IAuthUser) {
    return this.restaurantService.myRestaurant(user.uid);
  }
}
