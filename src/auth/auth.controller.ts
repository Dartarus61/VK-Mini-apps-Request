import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthenticationDTO } from './dto/authentication.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 200 })
  @Post('/signUpIn')
  signUpIn(
    @Body('userId') userId: number,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];
    return this.authService.signUpIn(new AuthenticationDTO({ userId, uri }));
  }
}
