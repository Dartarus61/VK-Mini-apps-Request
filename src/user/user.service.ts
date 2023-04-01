import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/models/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

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

    return user;
  }

  async getUserByVkUserId(userId: number) {
    const user = await this.userRepository.findOne({
      where: { userId },
      include: { all: true },
    });

    return user;
  }

  async editNotify(notify: boolean, token: string) {
    const user = await this.authService.getUserData(token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    await user.update('notify', notify);

    return this.userRepository.findByPk(user.id);
  }

  async updatePrem(userId: number, flag: boolean) {
    const user = await this.getUserByVkUserId(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    if (flag) {
      let date = new Date();
      date.setMonth(date.getMonth() + 1);
      await this.userRepository.update(
        { isPrem: flag, expiredPrem: date.toLocaleDateString() },
        { where: { userId } },
      );
    } else {
      await this.userRepository.update({ isPrem: flag }, { where: { userId } });
    }

    return 'ok';
  }
}
