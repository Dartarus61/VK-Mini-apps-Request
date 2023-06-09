import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { CollectRequestModule } from 'src/collect-request/collect-request.module';
import { PRIVATE_KEY } from 'src/core/config';
import { User } from 'src/models/user.model';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
  imports: [
    JwtModule.register({
      secret: process.env.PRIVATE_KEY,
    }),
    SequelizeModule.forFeature([User]),
    UserModule,
    forwardRef(() => CollectRequestModule),
  ],
})
export class AuthModule {}
