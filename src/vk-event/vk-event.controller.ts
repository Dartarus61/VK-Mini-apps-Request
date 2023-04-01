import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RequestCBDTO } from './dto/requestCB.dto';
import { VkEventService } from './vk-event.service';

@Controller('vkEvent')
export class VkEventController {
  constructor(private vkEventService: VkEventService) {}

  @Post('/callback')
  @HttpCode(200)
  callbackVk(@Body() dto: RequestCBDTO) {
    return this.vkEventService.switchCB(dto);
  }
}
