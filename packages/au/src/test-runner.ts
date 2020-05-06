import { Char, DI, IContainer } from '@aurelia/kernel';
import { IHttpServerOptions } from '@aurelia/runtime-node';
import { DevServer, getLogLevel, IDevServerConfig } from './dev-server';

// TODO: remove this as not used. It seems that it is moved to AOT.
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

export class TestRunner extends DevServer {
  public constructor(
    @IContainer
    container: IContainer,
  ) {
    super(container);
  }

  public static create(container = DI.createContainer()): TestRunner {
    return new TestRunner(container);
  }

  public async runOnce(config: IDevServerConfig): Promise<void> {
    await this.run(config);
  }

  protected getNodeConfigurationOptions(logLevel: IDevServerConfig['logLevel'], scratchDir: string): Partial<IHttpServerOptions> {
    return {
      port: 0,
      level: getLogLevel(logLevel),
      root: scratchDir,
    };
  }
}
