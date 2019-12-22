import {
  DebugConfiguration,
} from '@aurelia/debug';
import {
  resolve,
  join,
  delimiter,
  normalize,
} from 'path';
import {
  spawn,
} from 'child_process';
import {
  DI,
  LoggerConfiguration,
  LogLevel,
  ColorOptions,
  Registration,
  PLATFORM,
  ILogger,
} from '@aurelia/kernel';
import {
  IFileSystem,
  NodeFileSystem,
  ServiceHost,
} from '@aurelia/aot';

export type IProcessEnv = NodeJS.ProcessEnv;
export const IProcessEnv = DI.createInterface<IProcessEnv>('IProcessEnv').withDefault(x => x.instance(process.env));

export type IProcess = NodeJS.Process;
export const IProcess = DI.createInterface<IProcess>('IProcess').withDefault(x => x.instance(process));

export interface ISystem {
  readonly isWin: boolean;
  readonly isMac: boolean;
  readonly isLinux: boolean;
  which(cmd: string | string[]): Promise<string>;
}
export const ISystem = DI.createInterface<ISystem>('ISystem').withDefault(x => x.singleton(System));

function trimWrappingQuotes(value: string): string {
  if (value[0] === '"' && value[value.length - 1] === '"') {
    return value.slice(1, -1);
  }
  return value;
}

export class System {
  public readonly isWin: boolean;
  public readonly isMac: boolean;
  public readonly isLinux: boolean;

  public constructor(
    @IProcess
    private readonly proc: IProcess,
    @IFileSystem
    private readonly fs: IFileSystem,
  ) {
    const platform = proc.platform;
    const env = proc.env;
    this.isWin = platform === 'win32' || env.OSTYPE === 'cygwin' || env.OSTYPE === 'msys';
    this.isMac = platform === 'darwin';
    this.isLinux = !this.isWin && !this.isMac;
  }

  public async which(cmd: string | string[]): Promise<string> {
    if (Array.isArray(cmd)) {
      let err: Error = (void 0)!;
      for (const c of cmd) {
        try {
          const result = await this.which(c);
          return result;
        } catch (e) {
          err = e;
        }
      }

      throw err;
    }

    const proc = this.proc;
    const env = proc.env;

    if (this.isWin) {
      let paths: string[];

      if (cmd.includes('/') || cmd.includes('\\')) {
        paths = [cmd];
      } else {
        const key = Object.keys(env).find(key => key.toUpperCase() === 'PATH');
        if (key === void 0) {
          paths = [join(proc.cwd(), cmd)];
        } else {
          const envPaths = (env[key]!).split(delimiter).map(trimWrappingQuotes);
          paths = [proc.cwd(), ...envPaths].map(p => join(p, cmd));
        }
      }

      let exts: string[];
      if (env.PATHEXT === void 0) {
        exts = ['.EXE', '.CMD', '.BAT', '.COM'];
      } else {
        exts = env.PATHEXT.split(delimiter);
      }
      const hasValidExt = exts.some(ext => cmd.toLowerCase().endsWith(ext.toLowerCase()));

      for (const path of paths) {
        if (hasValidExt && await this.isExe(path)) {
          return normalize(path);
        }

        for (const ext of exts) {
          const pathWithExt = `${path}${ext}`;
          if (await this.isExe(pathWithExt)) {
            return normalize(pathWithExt);
          }
        }
      }

      for (const path of paths) {
        if (await this.isExe(path)) {
          return normalize(path);
        }
      }
    } else {
      if (cmd.includes('/')) {
        if (await this.isExe(cmd)) {
          return normalize(cmd);
        }
      } else {
        if (env.PATH !== void 0) {
          const paths = env.PATH.split(delimiter).map(trimWrappingQuotes).map(p => join(p, cmd));
          for (const path of paths) {
            if (await this.isExe(path)) {
              return normalize(path);
            }
          }
        }
      }
    }
  
    const err = new Error(`not found: ${cmd}`);
    (err as Error & { code: string })['code'] = 'ENOENT';
  
    throw err;
  }

  private async isExe(path: string): Promise<boolean> {
    const fs = this.fs;
    if (await fs.isReadable(path)) {
      const stat = await fs.stat(path);
      if (this.isWin) {
        return stat.isSymbolicLink() || stat.isFile();
      }

      if (stat.isFile()) {
        const mode = stat.mode;
        const uid = stat.uid;
        const gid = stat.gid;
    
        const myUid = process.getuid();
        const myGid = process.getgid();
    
        return (
          (mode & 0o001) > 0 ||
          ((mode & 0o010) > 0 && gid === myGid) ||
          ((mode & 0o100) > 0 && uid === myUid) ||
          ((mode & 0o110) > 0 && myUid === 0)
        );
      }
    }

    return false;
  }
}

export class ChromeBrowser {
  public constructor(
    @ISystem
    private readonly sys: ISystem,
    @IProcess
    private readonly proc: IProcess,
    @ILogger
    private readonly logger: ILogger,
  ) {}

  public async open(url: string): Promise<void> {
    const proc = this.proc;
    const logger = this.logger;
    const path = await this.getPath();
    const childProc = spawn(path, [url]);

    childProc.stdout.on('data', chunk => proc.stdout.write(chunk));
    childProc.stderr.on('data', chunk => proc.stderr.write(chunk));

    childProc.on('exit', (code, signal) => {
      logger.debug(`Process ${path} [${url}] exited with code ${code} and signal ${signal}`);

      setTimeout(() => proc.exit(code!), 3000);
    });

    childProc.on('error', err => {
      proc.stderr.write(err.toString());
    });
  }

  private async getPath(): Promise<string> {
    const sys = this.sys;
    const proc = this.proc;
    const env = proc.env;

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

    return sys.which(paths);
  }
}


(async function () {
  DebugConfiguration.register();

  // Just for testing
  // const root = resolve(__dirname, '..', '..', '..', '..', 'test', 'realworld');

  const container = DI.createContainer();
  container.register(
    LoggerConfiguration.create(console, LogLevel.debug, ColorOptions.colors),
    Registration.singleton(IFileSystem, NodeFileSystem),
  );

  // const host = new ServiceHost(container);

  // await host.executeEntryFile(root);

  const browser = container.get(ChromeBrowser);
  await browser.open('https://google.com');

})().catch(err => {
  console.error(err);
  process.exit(1);
});