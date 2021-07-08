import { LogLevel as $LogLevel } from '@aurelia/kernel';
import { IHttpServerOptions, LogLevel } from './interfaces.js';
export declare class HttpServerOptions implements IHttpServerOptions {
    root: string;
    hostName: string;
    port: number;
    useHttp2: boolean;
    useHttps: boolean;
    key: string | undefined;
    cert: string | undefined;
    logLevel: LogLevel;
    responseCacheControl: string | undefined;
    constructor(root?: string, hostName?: string, port?: number, useHttp2?: boolean, useHttps?: boolean, key?: string | undefined, cert?: string | undefined, logLevel?: LogLevel, responseCacheControl?: string | undefined);
    applyConfig(config: Partial<IHttpServerOptions>): void;
    toString(indent?: string): string;
    get level(): $LogLevel;
    applyOptionsFromCli(cwd: string, args: string[], argPrefix?: string): void;
}
//# sourceMappingURL=server-options.d.ts.map