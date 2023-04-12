import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { Op } from 'sequelize';
import { AuthService } from 'src/auth/auth.service';
import { GROUP_ACCESS_KEY, VK_URL } from 'src/core/config';
import {
  CLAIM_TEXT,
  GENA_ID,
  KEYBOARD_FOR_CLAIM,
  MESSAGE_TEXT,
} from 'src/core/constants';
import { Request } from 'src/models/request.model';
import { Subcription } from 'src/models/subcriptions.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/user/user.service';
import { CreateRequestDTO } from './dto/createRequest.dto';
import { DeleteRequestDTO } from './dto/deleteRequest.dto';
import { SubOnRequestDTO } from './dto/subOnRequest.dto';
import { UpdateRequestDTO } from './dto/updateRequest.dto';
import { log } from 'console';

@Injectable()
export class CollectRequestService {
  constructor(
    @InjectModel(Request) private requestRepository: typeof Request,
    @InjectModel(Subcription) private subcriptionRepository: typeof Subcription,
    private authService: AuthService,
    private readonly httpService: HttpService,
  ) {}

  async createRequest(dto: CreateRequestDTO) {
    const user = await this.authService.getUserData(dto.token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    if (user.requests.length == 0) {
      const request = await this.requestRepository.create({
        title: dto.title,
        userId: user.id,
      });

      const uri = `${user.userId}_${request.id}`;

      await this.requestRepository.update(
        { uri },
        {
          where: {
            id: request.id,
          },
        },
      );

      return this.requestRepository.findByPk(request.id);
    } else if (user.isPrem) {
      const request = await this.requestRepository.create({
        title: dto.title,
        userId: user.id,
      });

      const uri = `${user.userId}_${request.id}`;

      await this.requestRepository.update(
        { uri },
        {
          where: {
            id: request.id,
          },
        },
      );

      return this.requestRepository.findByPk(request.id);
    }

    throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
  }

  async updateRequest(dto: UpdateRequestDTO) {
    const data = await this.verifyUserAndRequest(dto.token, dto.requestId);

    if (data[0].id !== data[1].userId) {
      throw new HttpException('Access is not allowed', HttpStatus.FORBIDDEN);
    }

    if (!data[1].active) {
      throw new HttpException('Request is not active', HttpStatus.BAD_REQUEST);
    }

    await this.requestRepository.update(
      { title: dto.title },
      {
        where: {
          id: data[1].id,
        },
      },
    );

    return await this.requestRepository.findByPk(dto.requestId);
  }

  async deleteRequest(dto: DeleteRequestDTO) {
    const data = await this.verifyUserAndRequest(dto.token, dto.requestId);

    if (data[0].id !== data[1].userId) {
      throw new HttpException('Access is not allowed', HttpStatus.FORBIDDEN);
    }

    await data[1].destroy();
    return 'successful';
  }

  async getRequestByURI(uri: string) {
    const request = await this.requestRepository.findOne({ where: { uri } });

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
    }

    if (!request.active) {
      throw new HttpException(request.banReason, HttpStatus.NOT_FOUND);
    }

    return request;
  }

  async subOnRequest(dto: SubOnRequestDTO) {
    const user = await this.authService.getUserData(dto.token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const request = await this.requestRepository.findOne({
      where: { uri: dto.requestURI },
      include: { model: User, as: 'user' },
    });

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.BAD_REQUEST);
    }

    if (!request.active) {
      throw new HttpException('Request is not active', HttpStatus.BAD_REQUEST);
    }

    const author = this.httpService.get(
      `${VK_URL}users.get?user_ids=${request.user.userId}&fields=blacklisted&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
    );

    const authorType = (
      await lastValueFrom(author.pipe(map((res) => res.data)))
    ).response[0];

    if (authorType.deactivated) {
      switch (authorType.deactivated) {
        case 'deleted':
          await this.requestRepository.update(
            { active: false, banReason: 'Страница пользователя удалена' },
            {
              where: {
                userId: request.user.id,
              },
            },
          );
          throw new HttpException(
            'Страница пользователя удалена',
            HttpStatus.FORBIDDEN,
          );
        case 'banned':
          await this.requestRepository.update(
            { active: false, banReason: 'Страница пользователя заблокирована' },
            {
              where: {
                userId: request.user.id,
              },
            },
          );
          throw new HttpException(
            'Страница пользователя заблокирована',
            HttpStatus.FORBIDDEN,
          );
        default:
          break;
      }
    }
    if (authorType.blacklisted == 1) {
      await this.requestRepository.update(
        { active: false, banReason: 'Неактивная страница клиента' },
        {
          where: {
            userId: request.user.id,
          },
        },
      );
      throw new HttpException(
        'Неактивная страница клиента',
        HttpStatus.FORBIDDEN,
      );
    }

    const candidate = await this.subcriptionRepository.findOne({
      where: {
        requestId: request.id,
        userId: user.id,
      },
    });

    if (candidate) {
      throw new HttpException(
        'User already subscribe on this event',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newSubscription = await this.subcriptionRepository.create({
      requestId: request.id,
      userId: user.id,
    });

    if (request.user.notify) {
      const userData = await this.httpService.get(
        `${VK_URL}users.get?user_ids=${user.userId}&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
      );

      const username = (
        await lastValueFrom(userData.pipe(map((res) => res.data)))
      ).response[0];

      console.log(`try to send message to ${username.first_name}`);

      const { data } = await firstValueFrom(
        this.httpService
          .post(
            `${VK_URL}messages.send?user_id=${
              request.user.userId
            }&random_id=${this.getRandomInt(
              10000,
              10000000,
            )}&message=${MESSAGE_TEXT(
              `${username.first_name} ${username.last_name}`,
              user.userId,
              request.title,
            )}&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
          )
          .pipe(
            catchError((error: AxiosError) => {
              console.log(error.response.data);
              throw 'An error happened!';
            }),
          ),
      );
      console.log(data);
    }

    return newSubscription;
  }

  async claim(token: string, url: string) {
    const user = await this.authService.getUserData(token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const request = await this.requestRepository.findOne({
      where: { uri: url },
      include: { model: User, as: 'user' },
    });

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.BAD_REQUEST);
    }

    const userData = await this.httpService.get(
      `${VK_URL}users.get?user_ids=${user.userId}&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
    );

    const username = (
      await lastValueFrom(userData.pipe(map((res) => res.data)))
    ).response[0];

    console.log(
      CLAIM_TEXT(
        `${username.first_name} ${username.last_name})`,
        user.userId,
        url,
      ),
    );

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${VK_URL}messages.send?user_id=${
            request.user.userId
          }&random_id=${this.getRandomInt(
            10000,
            10000000,
          )}&message=Жалоба на данную заявку<br>От @id${user.userId} (${
            username.first_name
          } ${
            username.last_name
          })<br><br>Проверить, при наличии нарушении заблокировать&keyboard=${JSON.stringify(
            KEYBOARD_FOR_CLAIM,
          )}&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    console.log(data);
    console.log(data.error.request_params);

    return 'successful';
  }

  async getAllRequest(token: string) {
    const user = await this.authService.getUserData(token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    return user.requests;
  }

  async getCountOfLeeds(userId: number) {
    return (
      await this.subcriptionRepository.findAndCountAll({
        include: {
          model: Request,
          as: 'request',
          where: {
            userId,
          },
        },
      })
    ).count;
  }

  async getSubsByRequestId(id: number) {
    return await this.subcriptionRepository.findAll({
      attributes: ['requestId'],
      where: {
        requestId: id,
      },
      include: {
        model: User,
        attributes: ['userId'],
      },
    });
  }

  async changeVisabilityOfRequest(
    userId: number,
    flag: boolean,
    message: string,
  ) {
    const requests = await this.requestRepository.findAll({
      offset: 1,
      include: {
        model: User,
        as: 'user',
        where: {
          userId,
        },
      },
    });

    await Promise.all([
      requests.forEach(async (el) => {
        await el.update({ active: flag, banReason: message });
        await el.save();
      }),
    ]);
  }

  async verifyUserAndRequest(
    token: string,
    requestId: number,
  ): Promise<[User, Request]> {
    const user = await this.authService.getUserData(token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const request = await this.requestRepository.findByPk(requestId);

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.BAD_REQUEST);
    }

    return [user, request];
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
  }
}
