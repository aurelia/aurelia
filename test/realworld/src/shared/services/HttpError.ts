export class HttpError extends Error {
  public msg: Response;
  constructor(msg: Response) {
    super();
    this.msg = msg;
  }
}
