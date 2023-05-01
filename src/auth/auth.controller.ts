import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthenticationDTO } from './dto/authentication.dto';
import { JwtAuthGuard } from './auth.guard';

@ApiTags('auth')
@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 200 })
  @Post('/signUpIn')
  signUpIn(
    @Headers('Authorization') authorization,
  ) {
    console.log(authorization);
    
    const uri = authorization.split(' ')[1];
    return this.authService.signUpIn(uri);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/whoAmI')
  whoAmI(@Headers('Authorization') authorization) {
    const uri = authorization.split(' ')[1];
    return this.authService.whoAmI(uri);
  }
}
