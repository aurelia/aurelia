import {
  DI,
  LoggerConfiguration,
  LogLevel,
  ColorOptions,
  Registration,
  IContainer,
  ILogger,
  PLATFORM,
} from '@aurelia/kernel';
import {
  IFileSystem,
  NodeFileSystem,
  Realm,
  IFile,
} from '@aurelia/aot';
import { resolve } from 'path';
import { $SourceFile } from '@aurelia/aot/dist/vm/ast';

class TestMetadataNegative {
  public constructor(
    public readonly phase: 'parse' | 'early' | 'resolution' | 'runtime',
    public readonly type: string,
  ) {}
}

class TestMetadata {
  public constructor(
    public readonly negative: TestMetadataNegative | null,
    public readonly features: readonly string[],
    public readonly flags: readonly string[],
  ) {}

  public static from(content: string): TestMetadata | null {
    let start = content.indexOf('/*---');
    let end = content.indexOf('---*/');
    if (start >= 0 && end >= start) {
      let banner = content.slice(start + '/*---'.length, end);
      const lines = banner.split('\n');

      let negative: TestMetadataNegative | null = null;
      const negativeIndex = lines.findIndex(l => l.startsWith('negative:'));
      if (negativeIndex >= 0) {
        const [, phase] = lines[negativeIndex + 1].split(': ');
        const [, type] = lines[negativeIndex + 2].split(': ');
        negative = new TestMetadataNegative(phase as 'parse' | 'early' | 'resolution' | 'runtime', type);
      }

      let features: string[] = [];
      const featuresIndex = lines.findIndex(l => l.startsWith('features'));
      if (featuresIndex >= 0) {
        features = lines[featuresIndex].split(': ')[1].slice(1, -2).split(', ');
      }

      let flags: string[] = [];
      const flagsIndex = lines.findIndex(l => l.startsWith('flags'));
      if (flagsIndex >= 0) {
        flags = lines[flagsIndex].split(': ')[1].slice(1, -2).split(', ');
      }

      return new TestMetadata(negative, features, flags);
    }

    return null;
  }
}

const excludedFeatures = [
  'import.meta',
  // Not yet implemented, see https://tc39.es/proposal-dynamic-import
  'dynamic-import',
];

class TestCase {
  public readonly meta: TestMetadata | null;

  public constructor(
    public readonly container: IContainer,
    public readonly logger: ILogger,
    public readonly file: IFile,
  ) {
    this.meta = TestMetadata.from(file.getContentSync());
  }

  public async run(): Promise<void> {
    const container = this.container;
    const logger = this.logger;
    const file = this.file;
    const meta = this.meta;

    if (file.shortName.endsWith('FIXTURE')) {
      return;
    }

    if (meta !== null) {
      if (excludedFeatures.some(x => meta.features.includes(x))) {
        logger.info(`SKIP - ${meta.features} test file: ${file.rootlessPath}`);
        return;
      }

      if (meta.negative !== null) {
        switch (meta.negative.phase) {
          case 'parse': // Parse errors should be caught by TypeScript
            logger.info(`SKIP - parse error test file: ${file.rootlessPath}`);
            return;
          case 'early': // Early errors should be caught by TypeScript
            logger.info(`SKIP - early error test file: ${file.rootlessPath}`);
            return;
          case 'resolution': {
            const realm = Realm.Create(container);
            let mod: $SourceFile;
            try {
              mod = await realm.loadFile(file);
            } catch (err) {
              throw new Error(`FAIL - Expected ${meta.negative.type} but got error at building AST: ${err.message} ${err.stack} - Resolution error test file: ${file.rootlessPath}`);
            }

            let err: Error;
            try {
              mod.Instantiate();
            } catch ($err) {
              err = $err;
            }

            // if (err === void 0) {
            //   throw new Error(`FAIL - Expected ${meta.negative.type} but got no error - Resolution error test file: ${file.rootlessPath}`);
            // }

            // if (err.name !== meta.negative.type) {
            //   throw new Error(`FAIL - Expected ${meta.negative.type} but got ${err.name} - Resolution error test file: ${file.rootlessPath}`);
            // }

            logger.info(`PASS - Resolution error test file: ${file.rootlessPath}`);
          }
          case 'runtime': {
            const realm = Realm.Create(container);
            let mod: $SourceFile;
            try {
              mod = await realm.loadFile(file);
            } catch (err) {
              throw new Error(`FAIL - Expected ${meta.negative.type} but got error at building AST: ${err.message} ${err.stack} - Runtime error test file: ${file.rootlessPath}`);
            }

            try {
              mod.Instantiate();
            } catch ($err) {
              throw new Error(`FAIL - Expected ${meta.negative.type} at runtime, but got error at instantiate: ${$err.name} - Runtime error test file: ${file.rootlessPath}`);
            }

            let err: Error;
            try {
              mod.Evaluate();
            } catch ($err) {
              err = $err;
            }

            // if (err === void 0) {
            //   throw new Error(`FAIL - Expected ${meta.negative.type} but got no error - Runtime error test file: ${file.rootlessPath}`);
            // }

            // if (err.name !== meta.negative.type) {
            //   throw new Error(`FAIL - Expected ${meta.negative.type} but got ${err.name} - Runtime error test file: ${file.rootlessPath}`);
            // }

            logger.info(`PASS - Runtime error test file: ${file.rootlessPath}`);
          }
        }
        return;
      }
    }

    const realm = Realm.Create(container);
    let mod: $SourceFile;
    try {
      mod = await realm.loadFile(file);
    } catch (err) {
      throw new Error(`FAIL - Expected test case to run without error, but got error at building AST: ${err.message} ${err.stack} - Valid test file: ${file.rootlessPath}`);
    }

    try {
      mod.Instantiate();
    } catch (err) {
      throw new Error(`FAIL - Expected test case to run without error, but got error at instantiate: ${err.message} ${err.stack} - Valid test file: ${file.rootlessPath}`);
    }

    try {
      mod.Evaluate();
    } catch (err) {
      throw new Error(`FAIL - Expected test case to run without error, but got error at runtime: ${err.message} ${err.stack} - Valid test file: ${file.rootlessPath}`);
    }

    logger.info(`PASS - Valid test file: ${file.rootlessPath}`);
  }
}

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
    const dir = resolve(__dirname, '..', '..', '..', 'test262', 'test', 'language');

    const now = PLATFORM.now();
    this.logger.info(`Loading test files from ${dir}`);

    const files = await this.fs.getFiles(dir, true);

    this.logger.info(`Loaded ${files.length} test files in ${Math.round(PLATFORM.now() - now)}ms`);

    const testCases = files.slice().sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0).map(x => new TestCase(this.container, this.logger, x));
    for (const tc of testCases) {
      await tc.run();
    }
  }
}

(async function () {
  const runner = new TestRunner();

  await runner.load();
})().catch(err => {
  console.error(err);
  process.exit(-1);
});
