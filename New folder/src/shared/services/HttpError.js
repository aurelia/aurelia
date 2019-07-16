export class HttpError extends Error {
  constructor(msg) {
    super();
    this.msg = msg;
  }
}
