import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRequestDTO {
  constructor(model) {
    this.title = model.title;
    this.token = model.uri;
  }

  @IsString({ message: 'Должно быть строкой' })
  readonly title: string;

  @ApiProperty({
    example:
      '?vk_user_id=494075&vk_app_id=6736218&vk_is_app_user=1&vk_are_notifications_enabled=1&vk_language=ru&vk_access_token_settings=&vk_platform=android&sign=htQFduJpLxz7ribXRZpDFUH-XEUhC9rBPTJkjUFEkRA',
    description: 'URI для верификации пользователя',
  })
  @IsString({ message: 'Должно быть строкой' })
  readonly token: string;
}
