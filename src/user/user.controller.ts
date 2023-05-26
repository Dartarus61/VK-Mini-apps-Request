import { Body, Controller, Headers, Put, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Throttle(10, 30)
  @UseGuards(JwtAuthGuard)
  @Put('/editNotify')
  editNotify(
    @Body('notify') notify: boolean,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];

    return this.userService.editNotify(notify, uri);
  }
}
