export class HttpError extends Error {
  msg: Response;
  constructor(msg: Response) {
    super();
    this.msg = msg;
  }
}
