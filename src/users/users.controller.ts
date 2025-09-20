import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUser(): object {
    return this.usersService.getUser();
  }
  @Get('/get')
  getUserPath(): object {
    return {
      message: 'get user path success',
    };
  }
  @Get('by-id/:id')
  getUserParam(@Param('id') id: number): object {
    return {
      message: 'get user path success ' + id,
    };
  }
  @Get('q')
  getUserQuery(
    @Query('user_id') user_id: number,
    @Query('search') search: string,
  ): object {
    return {
      search: `my user search is : ${search}`,
      user_id: 'my user query is : ' + user_id,
    };
  }

  @Post()
  create(@Body() body: { title: string; subtitle: string; total: number }) {
    console.log(body);
    return this.usersService.create(body);
  }

  @Delete('delete-id/:id')
  getUserDelete(@Param('id') id: number): object {
    return {
      message: 'you will deleted id : ' + id,
    };
  }

  @Put('update-id/:user_id')
  update(
    @Param('user_id') user_id: number,
    @Body() body: { title: string; subtitle: string; total: number },
  ) {
    body['user_id'] = user_id;
    return {
      data: body,
      status: 200,
      user_id: user_id,
      message: 'created successfully',
    };
  }
}
