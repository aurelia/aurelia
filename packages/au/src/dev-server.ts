import { RuntimeNodeConfiguration, normalizePath, IHttpServer, IHttpServerOptions } from '@aurelia/runtime-node';
import { ILogger, IContainer, LogLevel, DI } from '@aurelia/kernel';

export interface IDevServerConfig {
  readonly entryFile: string;
  readonly scratchDir: string;
  readonly wipeScratchDir?: boolean;
  readonly logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'none';
  readonly useHttp2: boolean;
  readonly keyPath?: string;
  readonly certPath?: string;
}

export function getLogLevel(str: IDevServerConfig['logLevel']): LogLevel {
  switch (str) {
    case 'trace': return LogLevel.trace;
    case 'debug': return LogLevel.debug;
    case 'info': return LogLevel.info;
    case 'warn': return LogLevel.warn;
    case 'error': return LogLevel.error;
    case 'fatal': return LogLevel.fatal;
    case 'none': return LogLevel.none;
  }
  return LogLevel.info;
}

export class DevServer {
  public constructor(
    @IContainer
    protected readonly container: IContainer
  ) { }

  public static create(container = DI.createContainer()): DevServer {
    return new DevServer(container);
  }

  public async run({
    entryFile,
    scratchDir,
    logLevel,
    keyPath,
    certPath,
    useHttp2
  }: IDevServerConfig): Promise<void> {

    entryFile = normalizePath(entryFile);
    scratchDir = normalizePath(scratchDir);

    // wireup
    const container = this.container.createChild();
    container.register(RuntimeNodeConfiguration.create(this.getNodeConfigurationOptions(logLevel, scratchDir, useHttp2, keyPath, certPath)));
    const logger = container.get(ILogger);
    logger.info(`Starting test runner with scratchDir ${scratchDir} and entryFile ${entryFile}`);

    // TODO compile/bundle
    // TODO inject the entry script to index.html template (from user-space)

    // start the http/file/websocket server
    const server = container.get(IHttpServer);
    await server.start();
  }

  protected getNodeConfigurationOptions(
    logLevel: IDevServerConfig['logLevel'],
    scratchDir: string,
    useHttp2: boolean,
    keyPath?: string,
    certPath?: string,
  ): Partial<IHttpServerOptions> {
    if (useHttp2 && !(keyPath && certPath)) {
      throw new Error(`keyPath and certPath are required for a HTTP/2 server`);
    }

    return {
      port: useHttp2 ? 443 : 0,
      level: getLogLevel(logLevel),
      root: scratchDir,
      useHttp2,
      keyPath: keyPath ? normalizePath(keyPath) : void 0,
      certPath: certPath ? normalizePath(certPath) : void 0,
    };
  }
}
