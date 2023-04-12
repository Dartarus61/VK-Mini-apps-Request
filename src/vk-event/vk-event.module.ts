import { HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CollectRequestModule } from 'src/collect-request/collect-request.module';
import { UserModule } from 'src/user/user.module';
import { VkEventController } from './vk-event.controller';
import { VkEventService } from './vk-event.service';

@Module({
  controllers: [VkEventController],
  providers: [VkEventService],
  imports: [CollectRequestModule, UserModule, HttpService],
})
export class VkEventModule {}
