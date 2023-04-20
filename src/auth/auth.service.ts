import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';
import { AuthenticationDTO } from './dto/authentication.dto';
import { ParsedUrlQuery } from 'querystring';
import * as crypto from 'crypto';
import { IQueryParam } from './interface/queryParam.interface';
import { PRIVATE_KEY } from 'src/core/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CollectRequestService } from 'src/collect-request/collect-request.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => CollectRequestService))
    private requestsService: CollectRequestService,
  ) {}

  async signUpIn(dto: AuthenticationDTO) {
    const verifyUser = this.verifyLaunchParams(dto.uri, PRIVATE_KEY);

    if (!verifyUser) {
      throw new HttpException(
        'URI is invalid while signUpIn',
        HttpStatus.FORBIDDEN,
      );
    }

    const userId = this.getUserIdFromURI(dto.uri);

    if (userId !== dto.userId) {
      throw new HttpException(
        'User ID is not an equal',
        HttpStatus.BAD_REQUEST,
      );
    }

    let user = await this.userService.getUserByVkUserId(dto.userId);

    if (!user) {
      user = await this.userService.createUser(dto.userId);
    }

    //const token = await this.generateToken(user);

    return 'successful';
  }

  private async generateToken(user: User) {
    const payload = {
      userId: user.userId,
    };
    return {
      token: this.jwtService.sign(payload, { secret: PRIVATE_KEY }),
    };
  }

  verifyUserId(token: string) {
    return this.verifyLaunchParams(token, PRIVATE_KEY);
  }

  getUserIdFromURI(token: string) {
    let tokenUserId = token.match(new RegExp('vk_user_id=\\d*', 'gm'));

    if (tokenUserId == null) {
      throw new HttpException(
        'URI is invalid while get user from uri',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = tokenUserId[0].split('=')[1];
    console.log(+userId);

    return +userId;
  }

  async getUserData(token: string) {
    const verifyUser = this.verifyLaunchParams(token, PRIVATE_KEY);

    if (!verifyUser) {
      throw new HttpException(
        'URI is invalid while get user data',
        HttpStatus.FORBIDDEN,
      );
    }

    const user = await this.userService.getUserByVkUserId(
      this.getUserIdFromURI(token),
    );

    return user;
  }

  async whoAmI(token: string) {
    const user = await this.getUserData(token);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const requestsCount = user.requests.length;

    const countOfLeed = await this.requestsService.getCountOfLeeds(user.id);

    const tempBodyOfUser = JSON.stringify(user, null, 2);
    const userObject = JSON.parse(tempBodyOfUser);

    const finalObject = {
      ...userObject,
      requestCount: requestsCount,
      countOfLead: countOfLeed,
    };

    return finalObject;
  }

  private verifyLaunchParams(
    searchOrParsedUrlQuery: string | ParsedUrlQuery,
    secretKey: string,
  ): boolean {
    let sign: string | undefined;
    const queryParams: IQueryParam[] = [];

    /**
     * Функция, которая обрабатывает входящий query-параметр. В случае передачи
     * параметра, отвечающего за подпись, подменяет "sign". В случае встречи
     * корректного в контексте подписи параметра добавляет его в массив
     * известных параметров.
     * @param key
     * @param value
     */
    const processQueryParam = (key: string, value: any) => {
      if (typeof value === 'string') {
        if (key === 'sign') {
          sign = value;
        } else if (key.startsWith('vk_')) {
          queryParams.push({ key, value });
        }
      }
    };

    if (typeof searchOrParsedUrlQuery === 'string') {
      // Если строка начинается с вопроса (когда передан window.location.search),
      // его необходимо удалить.
      const formattedSearch = searchOrParsedUrlQuery.startsWith('?')
        ? searchOrParsedUrlQuery.slice(1)
        : searchOrParsedUrlQuery;

      // Пытаемся спарсить строку как query-параметр.
      for (const param of formattedSearch.split('&')) {
        const [key, value] = param.split('=');
        processQueryParam(key, value);
      }
    } else {
      for (const key of Object.keys(searchOrParsedUrlQuery)) {
        const value = searchOrParsedUrlQuery[key];
        processQueryParam(key, value);
      }
    }
    // Обрабатываем исключительный случай, когда не найдена ни подпись в параметрах,
    // ни один параметр, начинающийся с "vk_", дабы избежать
    // излишней нагрузки, образующейся в процессе работы дальнейшего кода.
    if (!sign || queryParams.length === 0) {
      return false;
    }
    // Снова создаём query в виде строки из уже отфильтрованных параметров.
    const queryString = queryParams
      // Сортируем ключи в порядке возрастания.
      .sort((a, b) => a.key.localeCompare(b.key))
      // Воссоздаем новый query в виде строки.
      .reduce<string>((acc, { key, value }, idx) => {
        return (
          acc + (idx === 0 ? '' : '&') + `${key}=${encodeURIComponent(value)}`
        );
      }, '');

    // Создаём хеш получившейся строки на основе секретного ключа.
    const paramsHash = crypto
      .createHmac('sha256', secretKey)
      .update(queryString)
      .digest()
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=$/, '');

    return paramsHash === sign;
  }
}
