import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Request } from 'src/models/request.model';
import { Subcription } from 'src/models/subcriptions.model';
import { CollectRequestController } from './collect-request.controller';
import { CollectRequestService } from './collect-request.service';

@Module({
  controllers: [CollectRequestController],
  providers: [CollectRequestService],
  exports: [CollectRequestService],
  imports: [
    SequelizeModule.forFeature([Request, Subcription]),
    forwardRef(() => AuthModule),
    HttpModule,
  ],
})
export class CollectRequestModule {}
