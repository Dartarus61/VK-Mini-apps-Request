import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthService } from 'src/auth/auth.service';
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

    if (!data[0].requests.includes(data[1])) {
      throw new HttpException('Access is not allowed', HttpStatus.FORBIDDEN);
    }

    if (!data[1].active) {
      throw new HttpException('Request is not active', HttpStatus.BAD_REQUEST);
    }

    await data[1].update('title', dto.title);

    return await this.requestRepository.findByPk(dto.requestId);
  }

  async deleteRequest(dto: DeleteRequestDTO) {
    const data = await this.verifyUserAndRequest(dto.token, dto.requestId);

    if (!data[0].requests.includes(data[1])) {
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

    const newSubscription = await this.subcriptionRepository.create({
      requestId: request.id,
      userId: user.id,
    });

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
