import { IContainer } from '@aurelia/kernel';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import * as $url from 'url';
import { QualifiedHeaderValues } from './http-utils';

export type HttpContextState = 'head' | 'body' | 'end';

export interface IHttpContext extends HttpContext { }

export class HttpContext implements IHttpContext {
  public readonly container: IContainer;
  public state: HttpContextState = 'head';
  private readonly parsedHeaders: Record<string, QualifiedHeaderValues> = Object.create(null);
  private readonly _requestUrl: $url.UrlWithStringQuery;
  private rewrittenUrl: $url.UrlWithStringQuery | null = null;

  public constructor(
    container: IContainer,
    public readonly request: IncomingMessage | Http2ServerRequest,
    public readonly response: ServerResponse | Http2ServerResponse,
    public readonly requestBuffer: Buffer,
  ) {
    this.container = container.createChild();
    this._requestUrl = $url.parse(request.url!);
  }

  public getQualifiedRequestHeaderFor(headerName: string): QualifiedHeaderValues {
    return this.parsedHeaders[headerName]
      ?? (this.parsedHeaders[headerName] = new QualifiedHeaderValues(headerName, this.request.headers));
  }

  public rewriteRequestUrl(url: string) {
    this.rewrittenUrl = $url.parse(url);
  }

  public get requestUrl(): $url.UrlWithStringQuery {
    return this.rewrittenUrl ?? this._requestUrl;
  }
}
