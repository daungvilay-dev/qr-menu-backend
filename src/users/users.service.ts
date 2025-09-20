import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getUser(): object {
    return {
      message: 'get user service success',
    };
  }

  create(body: any): string {
    return 'success';
  }
}
