import {
  DI,
  LoggerConfiguration,
  LogLevel,
  ColorOptions,
  Registration,
  IContainer,
  ILogger,
} from '@aurelia/kernel';
import {
  IFileSystem,
  NodeFileSystem,
  Realm,
} from '@aurelia/aot';
import { resolve } from 'path';

class TestRunner {
  public readonly container: IContainer;
  public readonly fs: IFileSystem;
  public readonly logger: ILogger;

  public constructor() {
    const container = this.container = DI.createContainer();
    container.register(
      LoggerConfiguration.create(console, LogLevel.info, ColorOptions.noColors),
      Registration.singleton(IFileSystem, NodeFileSystem),
    );
    this.fs = container.get(IFileSystem);
    this.logger = container.get(ILogger).scopeTo('TestRunner');
  }

  public async load(): Promise<void> {
    this.logger.debug(`Loading test files`);

    const files = await this.fs.getFiles(resolve(__dirname, '..', '..', '..', 'test262', 'test', 'language'));

    this.logger.debug(`Loaded ${files.length} test files`);

    for (const file of files) {
      this.logger.info(`Running test file: ${file.rootlessPath}`);
      const realm = Realm.Create(this.container);
      const mod = await realm.loadFile(file);
      mod.Instantiate();
      mod.Evaluate();
    }
  }
}

(async function () {
  const runner = new TestRunner();

  await runner.load();
})().catch(console.error);
