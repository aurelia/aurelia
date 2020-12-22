import { ILogger } from '@aurelia/kernel';
import { IRequestHandler, IHttpServerOptions, IHttp2FileServer } from '../interfaces.js';
import { IHttpContext } from '../http-context.js';
export declare class FileServer implements IRequestHandler {
    private readonly opts;
    private readonly logger;
    private readonly root;
    private readonly cacheControlDirective;
    constructor(opts: IHttpServerOptions, logger: ILogger);
    handleRequest(context: IHttpContext): Promise<void>;
}
/**
 * File server with HTTP/2 push support
 */
export declare class Http2FileServer implements IHttp2FileServer {
    private readonly opts;
    private readonly logger;
    private readonly cacheControlDirective;
    private readonly root;
    private readonly filePushMap;
    constructor(opts: IHttpServerOptions, logger: ILogger);
    handleRequest(context: IHttpContext): void;
    private pushAll;
    private push;
    private prepare;
    private getPushInfo;
}
//# sourceMappingURL=file-server.d.ts.map