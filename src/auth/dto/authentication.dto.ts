import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AuthenticationDTO {
  constructor(model) {
    this.userId = model.userId;
    this.uri = model.uri;
  }

  @ApiProperty({ example: '1235543', description: 'VK user ID' })
  @IsNumber({}, { message: 'Должно быть числом' })
  readonly userId: number;

  @ApiProperty({
    example:
      '?vk_user_id=494075&vk_app_id=6736218&vk_is_app_user=1&vk_are_notifications_enabled=1&vk_language=ru&vk_access_token_settings=&vk_platform=android&sign=htQFduJpLxz7ribXRZpDFUH-XEUhC9rBPTJkjUFEkRA',
    description: 'URI для верификации пользователя',
  })
  @IsString({ message: 'Должно быть строкой' })
  readonly uri: string;
}
