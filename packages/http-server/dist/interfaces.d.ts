import { IHttpContext } from './http-context.js';
export declare const enum Encoding {
    utf8 = "utf8"
}
export declare type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'none';
export interface IHttpServerOptions {
    readonly root: string;
    readonly port: number;
    readonly hostName: string;
    readonly logLevel: LogLevel;
    readonly useHttp2: boolean;
    readonly useHttps: boolean;
    readonly key?: string;
    readonly cert?: string;
    readonly responseCacheControl?: string;
}
export declare class StartOutput {
    readonly realPort: number;
    constructor(realPort: number);
}
export interface IHttpServer {
    start(): Promise<StartOutput>;
    stop(): Promise<void>;
}
export interface IRequestHandler {
    handleRequest(context: IHttpContext): Promise<void>;
}
export interface IHttp2FileServer {
    handleRequest(context: IHttpContext): void;
}
export declare const IHttpServerOptions: import("@aurelia/kernel").InterfaceSymbol<IHttpServerOptions>;
export declare const IHttpServer: import("@aurelia/kernel").InterfaceSymbol<IHttpServer>;
export declare const IRequestHandler: import("@aurelia/kernel").InterfaceSymbol<IRequestHandler>;
export declare const IHttp2FileServer: import("@aurelia/kernel").InterfaceSymbol<IHttp2FileServer>;
//# sourceMappingURL=interfaces.d.ts.map