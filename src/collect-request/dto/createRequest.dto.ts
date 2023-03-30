export class CreateRequestDTO {
  constructor(model) {
    this.title = model.title;
    this.token = model.uri;
  }

  readonly title: string;
  readonly token: string;
}
