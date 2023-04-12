import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CollectRequestService } from 'src/collect-request/collect-request.service';
import { GROUP_ACCESS_KEY, VK_URL } from 'src/core/config';
import { UserService } from 'src/user/user.service';
import { RequestCBDTO } from './dto/requestCB.dto';

@Injectable()
export class VkEventService {
  constructor(
    private userService: UserService,
    private requestService: CollectRequestService,
    private readonly httpService: HttpService,
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
          '',
        );
        return 'ok';
      case 'donut_subscription_prolonged':
        await this.userService.updatePrem(dto.object.user_id, true);
        await this.requestService.changeVisabilityOfRequest(
          dto.object.user_id,
          true,
          '',
        );
        return 'ok';
      case 'donut_subscription_expired':
        await this.userService.updatePrem(dto.object.user_id, false);
        await this.requestService.changeVisabilityOfRequest(
          dto.object.user_id,
          false,
          'Не оплачена подписка',
        );
        return 'ok';
      case 'donut_subscription_cancelled':
        await this.userService.updatePrem(dto.object.user_id, false);
        await this.requestService.changeVisabilityOfRequest(
          dto.object.user_id,
          false,
          'Не оплачена подписка',
        );
        return 'ok';
      case 'message_event':
        this.requestService.banRequest(dto.object.payload.uri);
        const { data } = await firstValueFrom(
          this.httpService
            .post(
              `${VK_URL}messages.sendMessageEventAnswer?event_id=${
                dto.event_id
              }&user_id=${dto.object.user_id}&peer_id=${
                dto.object.peer_id
              }&event_data=${JSON.stringify({
                type: 'show_snackbar',
                text: 'Покажи исчезающее сообщение на экране',
              })}&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
            )
            .pipe(
              catchError((error: AxiosError) => {
                console.log(error.response.data);
                throw 'An error happened!';
              }),
            ),
        );
        console.log(data);
        return 'ok';
      default:
        return 'ok';
    }
  }
}
