import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';
import { AuthenticationDTO } from './dto/authentication.dto';
import { ParsedUrlQuery } from 'querystring';
import * as crypto from 'crypto';
import { IQueryParam } from './interface/queryParam.interface';
import { PRIVATE_KEY } from 'src/core/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userRepos: typeof User,
    private jwtService: JwtService,
  ) {}

  async signUpIn(dto: AuthenticationDTO) {
    const verifyUser = this.verifyLaunchParams(dto.uri, PRIVATE_KEY);

    if (!verifyUser) {
      throw new HttpException('URI is invalid', HttpStatus.FORBIDDEN);
    }

    let user = await this.userRepos.findOne({ where: { userId: dto.userId } });

    if (!user) {
      user = await this.userRepos.create({ userId: dto.userId });
    }

    const token = await this.generateToken(user);

    return token;
  }

  private generateToken(user: User) {
    const payload = {
      userId: user.userId,
      id: user.id,
    };
    return this.jwtService.sign(payload, { secret: PRIVATE_KEY });
  }

  verifyLaunchParams(
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
