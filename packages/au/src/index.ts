import {
  DebugConfiguration,
} from '@aurelia/debug';
import {
  join, resolve,
} from 'path';
import {
  spawn,
} from 'child_process';
import {
  ServiceHost,
  ExecutionContext,
  TransformationContext,
} from '@aurelia/aot';
import {
  DI,
  LogLevel,
  ILogger,
  Registration,
} from '@aurelia/kernel';
import {
  IFileSystem,
  IProcess,
  TempDir,
  ISystem,
  RuntimeNodeConfiguration,
  IHttpServer,
  FileServer,
  IRequestHandler,
  IHttpServerOptions,
  Encoding,
} from '@aurelia/runtime-node';
import {
  Printer,
  createPrinter,
} from 'typescript';

export interface IBrowser {
  readonly name: string;
  createSessionContext(
    url: string,
    flags: readonly string[],
  ): Promise<IBrowserSession>;
}

export interface IBrowserSession {
  readonly id: string;
  readonly path: string;
  readonly args: readonly string[];
  init(): Promise<void>;
  dispose(): Promise<void>;
}

export class ChromeBrowserSession implements IBrowserSession {
  public constructor(
    private readonly logger: ILogger,
    private readonly tmp: TempDir,
    public readonly id: string,
    public readonly path: string,
    public readonly args: string[],
  ) {
    this.logger = logger.root.scopeTo('ChromeBrowserSession');
  }

  public async init(): Promise<void> {
    this.logger.debug(`Creating tempDir "${this.tmp.path}"`);

    await this.tmp.ensureExists();
  }

  public async dispose(): Promise<void> {
    this.logger.debug(`Removing tempDir "${this.tmp.path}"`);

    await this.tmp.dispose();
  }
}

export class ChromeBrowser implements IBrowser {
  public readonly name = 'ChromeBrowser';

  public constructor(
    @ISystem
    private readonly sys: ISystem,
    @IProcess
    private readonly proc: IProcess,
    @IFileSystem
    private readonly fs: IFileSystem,
    @ILogger
    private readonly logger: ILogger,
  ) {
    this.logger = logger.root.scopeTo('ChromeBrowser');
  }

  public async createSessionContext(
    url: string,
    flags: readonly string[],
  ): Promise<IBrowserSession> {
    const sys = this.sys;
    const proc = this.proc;
    const fs = this.fs;
    const env = proc.env;

    this.logger.debug(`createSessionContext(url=${url},flags=${flags})`);

    let paths: string[];

    if (env.CHROME_BIN !== void 0) {
      paths = [env.CHROME_BIN];
    } else if (sys.isWin) {
      paths = [
        env.LOCALAPPDATA,
        env.PROGRAMFILES,
        env['PROGRAMFILES(X86)'],
      ].filter(p => p !== void 0).map(p => join(p!, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    } else if (sys.isMac) {
      paths = [join(env.HOME!, 'Applications', 'Google Chrome.app', 'Contents', 'MacOS', 'Google Chrome')];
    } else {
      paths = ['google-chrome', 'google-chrome-stable'];
    }

    const name = sys.generateName();
    const tmp = new TempDir(fs, name);
    const path = await sys.which(paths);
    const args = [
      `--user-data-dir=${tmp.path}`,
      `--enable-automation`,
      `--no-default-browser-check`,
      `--no-first-run`,
      `--disable-default-apps`,
      `--disable-popup-blocking`,
      `--disable-translate`,
      `--disable-background-timer-throttling`,
      `--disable-renderer-backgrounding`,
      `--disable-device-discovery-notifications`,
      // Headless:
      // '--headless',
      // '--disable-gpu',
      // '--disable-dev-shm-usage'

      // Debugging:
      // --remote-debugging-port=9222
      ...flags,
      url,
    ];

    this.logger.debug(`Opening "${path}"`);

    return new ChromeBrowserSession(this.logger, tmp, name, path, args);
  }
}

export class BrowserHost {
  public constructor(
    @ISystem
    private readonly sys: ISystem,
    @IProcess
    private readonly proc: IProcess,
    @ILogger
    private readonly logger: ILogger,
  ) {
    this.logger = logger.root.scopeTo('BrowserHost');
  }

  public async open(
    browser: IBrowser,
    url: string,
    ...flags: readonly string[]
  ): Promise<void> {
    const proc = this.proc;
    const logger = this.logger;

    const session = await browser.createSessionContext(url, flags);
    await session.init();

    const childProc = spawn(session.path, session.args);

    childProc.stdout.on('data', chunk => proc.stdout.write(chunk));
    childProc.stderr.on('data', chunk => proc.stderr.write(chunk));

    childProc.on('exit', (code, signal) => {
      logger.debug(`Process ${session.path} [${url}] exited with code ${code} and signal ${signal}`);

      setTimeout(() => {
        session.dispose().then(() => {
          proc.exit(code!);
        }).catch(console.error);
      }, 3000);
    });

    childProc.on('error', err => {
      proc.stderr.write(err.toString());
    });
  }
}

export class TestRunner {
  public constructor(
    @IHttpServerOptions
    private readonly opts: IHttpServerOptions,
    @IFileSystem
    private readonly fs: IFileSystem,
    @ILogger
    private readonly logger: ILogger,
  ) {
    this.logger = logger.root.scopeTo('TestRunner');
  }

  public async prepare(): Promise<void> {
    const fs = this.fs;
    const outFile = join(this.opts.root, 'index.html');

    const html = `
    <!doctype html>
    <html>
      <head>
      </head>
      <body>
        <script type="text/javascript">
          fetch('/api');
        </script>
      </body>
    </html>
    `;

    await fs.writeFile(outFile, html, Encoding.utf8);

  }
}

(async function () {
  DebugConfiguration.register();

  // Just for testing
  // const root = resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');

  const container = DI.createContainer();
  container.register(
    RuntimeNodeConfiguration.create({
      level: LogLevel.info,
      root: process.cwd(),
    }),
    Registration.singleton(IRequestHandler, FileServer),
  );

  // const server = container.get(IHttpServer);
  // await server.start();
  const serviceHost = container.get(ServiceHost);

  const fs = container.get(IFileSystem);

  const result = await serviceHost.execute({
    entries: [{
      file: join(__dirname, '..', '..', '..', '__tests__', 'setup-au.ts')
    }]
  });
  const outDir = join(__dirname, '..', '..', '__dist');
  await fs.rimraf(outDir);
  await result.ws.emit({ outDir });

  // const runner = container.get(TestRunner);
  // await runner.prepare();

  // const browser = container.get(ChromeBrowser);
  // const browserHost = container.get(BrowserHost);
  // await browserHost.open(browser, 'http://localhost:8080/index.html');

})().catch(err => {
  console.error(err);
  process.exit(1);
});
