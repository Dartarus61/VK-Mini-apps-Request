import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from 'src/auth/auth.module';
import { claimRequest } from 'src/models/request-claim.model';
import { Request } from 'src/models/request.model';
import { Subcription } from 'src/models/subcriptions.model';
import { CollectRequestController } from './collect-request.controller';
import { CollectRequestService } from './collect-request.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [CollectRequestController],
  providers: [
    CollectRequestService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [CollectRequestService],
  imports: [
    JwtModule.register({
      secret: process.env.PRIVATE_KEY,
    }),
    SequelizeModule.forFeature([Request, Subcription, claimRequest]),
    forwardRef(() => AuthModule),
    HttpModule,
  ],
})
export class CollectRequestModule {}
