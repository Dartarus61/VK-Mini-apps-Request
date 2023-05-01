import { IsString } from 'class-validator';

export class SubOnRequestDTO {
  constructor(model) {
    this.requestURI = model.requestURI;
    this.token = model.uri;
  }

  @IsString({ message: 'Должно быть строкой' })
  readonly requestURI: string;

  @IsString({ message: 'Должно быть строкой' })
  readonly token: string;
}
