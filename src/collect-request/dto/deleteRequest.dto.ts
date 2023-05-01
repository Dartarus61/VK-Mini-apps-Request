import { IsNumber, IsString } from 'class-validator';

export class DeleteRequestDTO {
  constructor(model) {
    this.requestId = model.requestId;
    this.token = model.uri;
  }

  @IsNumber({ allowNaN: false }, { message: 'Должно быть числом' })
  readonly requestId: number;

  @IsString({ message: 'Должно быть строкой' })
  readonly token: string;
}
