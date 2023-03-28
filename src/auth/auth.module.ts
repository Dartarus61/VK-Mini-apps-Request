import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { PRIVATE_KEY } from 'src/core/config';
import { User } from 'src/models/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      secret: process.env.PRIVATE_KEY,
    }),
    SequelizeModule.forFeature([User]),
  ],
})
export class AuthModule {}
