export class HttpError extends Error {
  public msg: Response;
  public constructor(msg: Response) {
    super();
    this.msg = msg;
  }
}
