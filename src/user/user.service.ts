import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userRepository: typeof User) {}

  async createUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        userId,
      },
    });

    if (user) {
      throw new HttpException('User is exist', HttpStatus.BAD_REQUEST);
    }

    return this.userRepository.create({ userId });
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findByPk(id, {
      include: { all: true },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async getUserByVkUserId(userId: number) {
    const user = await this.userRepository.findOne({
      where: { userId },
      include: { all: true },
    });

    return user;
  }
}
