export class SubOnRequestDTO {
  constructor(model) {
    this.requestURI = model.requestURI;
    this.token = model.uri;
  }

  readonly requestURI: string;
  readonly token: string;
}
