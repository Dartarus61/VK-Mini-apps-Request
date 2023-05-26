import { IsString, Length, MaxLength } from 'class-validator';

export class UpdateRequestDTO {
  constructor(model) {
    this.requestId = model.requestId;
    this.token = model.uri;
    this.title = model.title;
  }
  readonly requestId: number;

  @IsString({ message: 'Должно быть строкой' })
  @Length(1, 32, { message: 'Должно быть длиной 1-32 символа' })
  readonly title: string;
  @IsString({ message: 'Должно быть строкой' })
  readonly token: string;
}
