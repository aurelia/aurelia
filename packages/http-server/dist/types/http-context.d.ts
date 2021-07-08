/// <reference types="node" />
import { IContainer } from '@aurelia/kernel';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import * as $url from 'url';
import { QualifiedHeaderValues } from './http-utils.js';
export declare const enum HttpContextState {
    head = 1,
    body = 2,
    end = 3
}
export interface IHttpContext extends HttpContext {
}
export declare class HttpContext implements IHttpContext {
    readonly request: IncomingMessage | Http2ServerRequest;
    readonly response: ServerResponse | Http2ServerResponse;
    readonly requestBuffer: Buffer;
    readonly container: IContainer;
    state: HttpContextState;
    private readonly parsedHeaders;
    private readonly _requestUrl;
    private rewrittenUrl;
    constructor(container: IContainer, request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse, requestBuffer: Buffer);
    getQualifiedRequestHeaderFor(headerName: string): QualifiedHeaderValues;
    rewriteRequestUrl(url: string): void;
    get requestUrl(): $url.UrlWithStringQuery;
}
//# sourceMappingURL=http-context.d.ts.map