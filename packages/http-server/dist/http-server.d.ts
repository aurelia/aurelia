import { ILogger, IContainer } from '@aurelia/kernel';
import { IHttpServer, IHttpServerOptions, IRequestHandler, StartOutput, IHttp2FileServer } from './interfaces.js';
export declare class HttpServer implements IHttpServer {
    private readonly logger;
    private readonly opts;
    private readonly container;
    private readonly handlers;
    private server;
    constructor(logger: ILogger, opts: IHttpServerOptions, container: IContainer, handlers: readonly IRequestHandler[]);
    start(): Promise<StartOutput>;
    stop(): Promise<void>;
    private handleRequest;
}
export declare class Http2Server implements IHttpServer {
    private readonly logger;
    private readonly opts;
    private readonly container;
    private readonly http2FileServer;
    private server;
    constructor(logger: ILogger, opts: IHttpServerOptions, container: IContainer, http2FileServer: IHttp2FileServer);
    start(): Promise<StartOutput>;
    stop(): Promise<void>;
    private handleRequest;
}
//# sourceMappingURL=http-server.d.ts.map