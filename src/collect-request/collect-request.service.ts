import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, lastValueFrom, map } from 'rxjs';
import { Op } from 'sequelize';
import { AuthService } from 'src/auth/auth.service';
import { GROUP_ACCESS_KEY, VK_URL } from 'src/core/config';
import { MESSAGE_TEXT } from 'src/core/constants';
import { Request } from 'src/models/request.model';
import { Subcription } from 'src/models/subcriptions.model';
import { User } from 'src/models/user.model';
import { UserService } from 'src/user/user.service';
import { CreateRequestDTO } from './dto/createRequest.dto';
import { DeleteRequestDTO } from './dto/deleteRequest.dto';
import { SubOnRequestDTO } from './dto/subOnRequest.dto';
import { UpdateRequestDTO } from './dto/updateRequest.dto';

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

  async subOnRequest(dto: SubOnRequestDTO) {
    const user = await this.authService.getUserData(dto.token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const request = await this.requestRepository.findOne({
      where: { uri: dto.requestURI },
    });

    if (!request) {
      throw new HttpException('Request not found', HttpStatus.BAD_REQUEST);
    }

    if (!request.active) {
      throw new HttpException('Request is not active', HttpStatus.BAD_REQUEST);
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

    const userData = await this.httpService.get(
      `${VK_URL}users.get?user_ids=${174261333}&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
    );

    const username = (
      await lastValueFrom(userData.pipe(map((res) => res.data)))
    ).response[0];

    console.log(username);

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${VK_URL}messages.send?user_id=${user.userId}&random_id=${
            user.userId
          }&message=${MESSAGE_TEXT(
            `${username.first_name} ${username.last_name}`,
            user.userId,
          )}&v=5.131&access_token=${GROUP_ACCESS_KEY}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );

    return newSubscription;
  }

  async getAllRequest(token: string) {
    const user = await this.authService.getUserData(token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    return user.requests;
  }

  async getCountOfLeeds(user: User) {
    let count = 0;
    Promise.all([
      user.requests.forEach(async (el) => {
        count += (
          await this.subcriptionRepository.findAndCountAll({
            where: {
              requestId: el.id,
            },
          })
        ).count;
      }),
    ]);
    return count;
  }

  async changeVisabilityOfRequest(userId: number, flag: boolean) {
    const updateRequest = (
      await this.requestRepository.findAll({ where: { userId }, offset: 1 })
    ).map((el) => {
      return el.id;
    });

    if (!updateRequest) {
      return;
    }

    await this.requestRepository.update(
      { active: flag },
      {
        where: {
          id: {
            [Op.in]: updateRequest,
          },
        },
      },
    );
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
}
