export class DeleteRequestDTO {
  constructor(model) {
    this.requestId = model.requestId;
    this.token = model.uri;
  }

  readonly requestId: number;
  readonly token: string;
}
