import { DI, LogLevel } from '@aurelia/kernel';
import { IHttpContext } from './http-context';
import { ServerHttp2Stream, IncomingHttpHeaders } from 'http2';

export const enum Encoding {
  utf8 = 'utf8',
  utf16le = 'utf16le',
  latin1 = 'latin1',
  base64 = 'base64',
  ascii = 'ascii',
  hex = 'hex',
  raw = 'raw',
}

export const enum FileKind {
  Unknown = 0,
  Script  = 1,
  Markup  = 2,
  Style   = 3,
  JSON    = 4,
}

export type IProcessEnv = NodeJS.ProcessEnv;

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
  readonly keyPath?: string;
  readonly certPath?: string;
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

export const IProcessEnv = DI.createInterface<IProcessEnv>('IProcessEnv').withDefault(x => x.instance(process.env));
export const IProcess = DI.createInterface<IProcess>('IProcess').withDefault(x => x.instance(process));
export const ISystem = DI.createInterface<ISystem>('ISystem').noDefault();
export const IHttpServerOptions = DI.createInterface<IHttpServerOptions>('IHttpServerOptions').noDefault();
export const IHttpServer = DI.createInterface<IHttpServer>('IHttpServer').noDefault();
export const IRequestHandler = DI.createInterface<IRequestHandler>('IRequestHandler').noDefault();
export const IHttp2FileServer = DI.createInterface<IHttp2FileServer>('IHttp2FileServer').noDefault();
