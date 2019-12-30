import { ServiceHost } from '@aurelia/aot';
import { IHttpServerOptions, IFileSystem, Encoding, RuntimeNodeConfiguration, IRequestHandler, FileServer, normalizePath, IHttpServer } from '@aurelia/runtime-node';
import { ILogger, IContainer, LogLevel, Registration, Char, DI } from '@aurelia/kernel';
import { join } from 'path';
import { ChromeBrowser } from './browser/chrome';
import { BrowserHost } from './browser/host';

export interface ITestRunnerConfig {
  readonly entryFile: string;
  readonly scratchDir: string;
  readonly wipeScratchDir?: boolean;
  readonly logLevel?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'none';
}

function getLogLevel(str: ITestRunnerConfig['logLevel']): LogLevel {
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

export function computeRelativeDirectory(source: string, target: string): string {
  let prevSlashIndex = 0;
  let slashCount = 0;
  let ch = 0;
  for (let i = 0, ii = source.length; i < ii; ++i) {
    ch = source.charCodeAt(i);
    if (ch === Char.Slash) {
      prevSlashIndex = i;
    }
    if (ch !== target.charCodeAt(i)) {
      for (; i < ii; ++i) {
        if (source.charCodeAt(i) === Char.Slash) {
          ++slashCount;
        }
      }

      break;
    }
  }

  if (ch !== Char.Slash) {
    ++slashCount;
  }
  const prefix = slashCount === 0 ? './' : '../'.repeat(slashCount);
  return `${prefix}${target.slice(prevSlashIndex + 1)}`;
}

export class TestRunner {
  public constructor(
    @IContainer
    private readonly container: IContainer,
  ) {}

  public static create(container = DI.createContainer()): TestRunner {
    return new TestRunner(container);
  }

  public async runOnce({
    entryFile,
    scratchDir,
    wipeScratchDir,
    logLevel,
  }: ITestRunnerConfig): Promise<void> {
    entryFile = normalizePath(entryFile);
    scratchDir = normalizePath(scratchDir);

    // wireup
    const container = this.container.createChild();
    container.register(
      RuntimeNodeConfiguration.create({
        port: 0,
        level: getLogLevel(logLevel),
        root: scratchDir,
      }),
      Registration.singleton(IRequestHandler, FileServer),
    );

    const fs = container.get(IFileSystem);
    const serviceHost = container.get(ServiceHost);

    const logger = container.get(ILogger);
    logger.info(`Starting test runner with scratchDir ${scratchDir} and entryFile ${entryFile}`);

    // compile/bundle
    const result = await serviceHost.execute({ entries: [{ file: entryFile }] });
    if (await fs.isReadable(scratchDir) && wipeScratchDir) {
      await fs.rimraf(scratchDir);
    }
    await result.ws.emit({ outDir: scratchDir });

    // generate html file to run
    const outFile = join(scratchDir, 'index.html');

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <script type="module">
          import '.${entryFile.replace(result.ws.lastCommonRootDir, '').replace(/\.ts$/, '.js')}';
        </script>
      </body>
    </html>
    `;

    await fs.writeFile(outFile, html, Encoding.utf8);

    // serve the files
    const server = container.get(IHttpServer);
    const { realPort } = await server.start();

    // navigate to the html file
    const browser = container.get(ChromeBrowser);
    const browserHost = container.get(BrowserHost);
    await browserHost.open(browser, `http://localhost:${realPort}/index.html`);
  }
}
