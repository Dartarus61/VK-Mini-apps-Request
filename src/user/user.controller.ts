import { Body, Controller, Headers, Put } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Throttle(5, 30)
  @Put('/editNotify')
  editNotify(
    @Body('notify') notify: boolean,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];

    return this.userService.editNotify(notify, uri);
  }
}
