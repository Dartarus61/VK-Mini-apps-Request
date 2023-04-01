import { Injectable } from '@nestjs/common';
import { CollectRequestService } from 'src/collect-request/collect-request.service';
import { UserService } from 'src/user/user.service';
import { RequestCBDTO } from './dto/requestCB.dto';

@Injectable()
export class VkEventService {
  constructor(
    private userService: UserService,
    private requestService: CollectRequestService,
  ) {}

  async switchCB(dto: RequestCBDTO) {
    switch (dto.type) {
      case 'confirmation':
        if (dto.group_id == 219481464) {
          return 'd825af70';
        }
      case 'donut_subscription_create':
        await this.userService.updatePrem(dto.object.user_id, true);
        await this.requestService.changeVisabilityOfRequest(
          dto.object.user_id,
          true,
        );
        return 'ok';
      case 'donut_subscription_prolonged':
        await this.userService.updatePrem(dto.object.user_id, true);
        await this.requestService.changeVisabilityOfRequest(
          dto.object.user_id,
          true,
        );
        return 'ok';
      case 'donut_subscription_expired':
        await this.userService.updatePrem(dto.object.user_id, false);
        await this.requestService.changeVisabilityOfRequest(
          dto.object.user_id,
          false,
        );
        return 'ok';
      case 'donut_subscription_cancelled':
        await this.userService.updatePrem(dto.object.user_id, false);
        await this.requestService.changeVisabilityOfRequest(
          dto.object.user_id,
          false,
        );
        return 'ok';
      default:
        return 'ok';
    }
  }
}
