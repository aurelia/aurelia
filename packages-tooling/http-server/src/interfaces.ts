import { DI, LogLevel as $LogLevel } from '@aurelia/kernel';
import { IHttpContext } from './http-context';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'none';
export interface IHttpServerOptions {
  readonly root: string;
  readonly port: number;
  readonly hostName: string;
  readonly logLevel: LogLevel;
  /** @internal */
  readonly level: $LogLevel;
  readonly useHttp2: boolean;
  readonly useHttps: boolean;
  readonly key?: string;
  readonly cert?: string;
  readonly responseCacheControl?: string;
}

export class StartOutput {
  public constructor(
    public readonly realPort: number,
  ) {}
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

export const IHttpServerOptions = DI.createInterface<IHttpServerOptions>('IHttpServerOptions');
export const IHttpServer = DI.createInterface<IHttpServer>('IHttpServer');
export const IRequestHandler = DI.createInterface<IRequestHandler>('IRequestHandler');
export const IHttp2FileServer = DI.createInterface<IHttp2FileServer>('IHttp2FileServer');
