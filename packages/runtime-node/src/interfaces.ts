import { DI, LogLevel } from '@aurelia/kernel';
import { IHttpContext } from './http-context';

export const enum Encoding {
  utf8 = 'utf8',
}

export type IProcess = NodeJS.Process;

export interface ISystem {
  readonly isWin: boolean;
  readonly isMac: boolean;
  readonly isLinux: boolean;
  which(cmd: string | string[]): Promise<string>;
  generateName(): string;
}

export interface IHttpServerOptions {
  readonly root: string;
  readonly port: number;
  readonly hostName: string;
  readonly level: LogLevel;
  readonly useHttp2: boolean;
  readonly useHttps: boolean;
  readonly key?: string;
  readonly cert?: string;
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

export const IProcess = DI.createInterface<IProcess>('IProcess').withDefault(x => x.instance(process));
export const ISystem = DI.createInterface<ISystem>('ISystem').noDefault();
export const IHttpServerOptions = DI.createInterface<IHttpServerOptions>('IHttpServerOptions').noDefault();
export const IHttpServer = DI.createInterface<IHttpServer>('IHttpServer').noDefault();
export const IRequestHandler = DI.createInterface<IRequestHandler>('IRequestHandler').noDefault();
export const IHttp2FileServer = DI.createInterface<IHttp2FileServer>('IHttp2FileServer').noDefault();
