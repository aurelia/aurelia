import { IContainer } from '@aurelia/kernel';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

export const enum HttpContextState {
  head = 1,
  body = 2,
  end = 3,
}

export interface IHttpContext {
  state: HttpContextState;
  readonly request: IncomingMessage | Http2ServerRequest;
  readonly response: ServerResponse | Http2ServerResponse;
  readonly requestBuffer: Buffer;
}

export class HttpContext implements IHttpContext {
  public readonly container: IContainer;
  public state: HttpContextState = HttpContextState.head;

  public constructor(
    container: IContainer,
    public readonly request: IncomingMessage | Http2ServerRequest,
    public readonly response: ServerResponse | Http2ServerResponse,
    public readonly requestBuffer: Buffer,
  ) {
    this.container = container.createChild();
  }
}
