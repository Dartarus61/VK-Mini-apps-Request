import { Body, Controller, Headers, Put } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Put('/editNotify')
  editNotify(
    @Body('notify') notify: boolean,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];

    return this.userService.editNotify(notify, uri);
  }
}
