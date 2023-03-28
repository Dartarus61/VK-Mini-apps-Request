import { Body, Controller, Headers, Post, Response } from '@nestjs/common';
import { Response as Res } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthenticationDTO } from './dto/authentication.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 200 })
  @Post('/signUpIn')
  signUpIn(
    @Body('userId') userId: number,
    @Headers('Authorization') authorization,
    @Response() res: Res,
  ) {
    return this.authService.signUpIn(
      new AuthenticationDTO({ userId, authorization }),
    );
  }
}
