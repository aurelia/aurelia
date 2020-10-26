/// <reference types="node" />
import { IContainer } from '@aurelia/kernel';
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
export declare const enum HttpContextState {
    head = 1,
    body = 2,
    end = 3
}
export interface IHttpContext {
    state: HttpContextState;
    readonly request: IncomingMessage | Http2ServerRequest;
    readonly response: ServerResponse | Http2ServerResponse;
    readonly requestBuffer: Buffer;
}
export declare class HttpContext implements IHttpContext {
    readonly request: IncomingMessage | Http2ServerRequest;
    readonly response: ServerResponse | Http2ServerResponse;
    readonly requestBuffer: Buffer;
    readonly container: IContainer;
    state: HttpContextState;
    constructor(container: IContainer, request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse, requestBuffer: Buffer);
}
//# sourceMappingURL=http-context.d.ts.map