import { RuntimeNodeConfiguration, normalizePath, IHttpServer, IHttpServerOptions } from '@aurelia/runtime-node';
import { ILogger, IContainer, LogLevel, DI } from '@aurelia/kernel';
import { ChromeBrowser } from './browser/chrome';
import { BrowserHost } from './browser/host';

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
    wipeScratchDir,
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
    // const fs = container.get(IFileSystem);
    // const serviceHost = container.get(ServiceHost);
    const logger = container.get(ILogger);
    logger.info(`Starting test runner with scratchDir ${scratchDir} and entryFile ${entryFile}`);

    // TODO compile/bundle
    /* const result = await serviceHost.execute({ entries: [{ file: entryFile }] });
    if (await fs.isReadable(scratchDir) && wipeScratchDir) {
      await fs.rimraf(scratchDir);
    }
    await result.ws.emit({ outDir: scratchDir }); */

    // start the http/file/websocket server
    const server = container.get(IHttpServer);
    const { realPort } = await server.start();

    // TODO generate html file to run
    /*
    // TODO: this template need to come from the user-space, and just inject the script.
    const outFile = join(scratchDir, 'index.html');
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <app></app>
        <script type="module">
          import '.${entryFile.replace(result.ws.lastCommonRootDir, '').replace(/\.ts$/, '.js')}';
        </script>
      </body>
    </html>
    `;
    await fs.writeFile(outFile, html, Encoding.utf8); */
    // navigate to the html file
    const browser = container.get(ChromeBrowser);
    const browserHost = container.get(BrowserHost);
    const protocol = useHttp2 ? 'https' : 'http';
    await browserHost.open(browser, `${protocol}://localhost:${realPort}/index.html`);
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
