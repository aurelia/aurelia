import {
  DI,
  LoggerConfiguration,
  LogLevel,
  ColorOptions,
  Registration,
  IContainer,
  ILogger,
  PLATFORM,
  format,
} from '@aurelia/kernel';
import {
  IFileSystem,
  NodeFileSystem,
  Realm,
  IFile,
} from '@aurelia/aot';
import { resolve, join } from 'path';
import { $SourceFile } from '@aurelia/aot/dist/vm/ast';

class TestPhaseResult<T extends 'early' | 'resolution' | 'runtime' = 'early' | 'resolution' | 'runtime'> {
  public constructor(
    public readonly phase: T,
    public readonly file: IFile,
    public readonly result: unknown,
    public readonly err: Error | null = null,
  ) {}
}

class TestResult {
  public phase: 'early' | 'resolution' | 'runtime' = 'early';
  public early: TestPhaseResult<'early'> | null = null;
  public resolution: TestPhaseResult<'resolution'> | null = null;
  public runtime: TestPhaseResult<'runtime'> | null = null;
  public get last(): TestPhaseResult {
    return this[this.phase];
  }
}

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
  public readonly files: readonly IFile[];

  public constructor(
    public readonly container: IContainer,
    public readonly logger: ILogger,
    public readonly file: IFile,
    public readonly prerequisites: readonly IFile[],
  ) {
    this.meta = TestMetadata.from(file.getContentSync());
    this.files = [...prerequisites, file];
  }

  public async run(): Promise<TestResult> {
    const realm = Realm.Create(this.container);
    const files = this.files;

    for (let i = 0; i < files.length; ++i) {
      const result = await this.execute(realm, files[i]);
      if (result.last.err !== null || i === files.length - 1) {
        return result;
      }
    }
  }

  private async execute(realm: Realm, file: IFile): Promise<TestResult> {
    const result = new TestResult();

    let mod: $SourceFile;
    try {
      result.phase = 'early';
      mod = await realm.loadFile(file);
      result.early = new TestPhaseResult('early', file, void 0);
    } catch (err) {
      result.early = new TestPhaseResult('early', file, void 0, err);
      return result;
    }

    try {
      result.phase = 'resolution';
      mod.Instantiate();
      result.resolution = new TestPhaseResult('resolution', file, void 0);
    } catch (err) {
      result.resolution = new TestPhaseResult('resolution', file, void 0, err);
      return result;
    }

    try {
      result.phase = 'runtime';
      const res = mod.Evaluate();
      result.runtime = new TestPhaseResult('runtime', file, void 0);
    } catch (err) {
      result.runtime = new TestPhaseResult('runtime', file, void 0, err);
      return result;
    }

    return result;
  }
}

function compareFiles(a: IFile, b: IFile): number {
  const aPath = a.path.toLowerCase();
  const bPath = b.path.toLowerCase();
  const aLen = aPath.length;
  const bLen = bPath.length;
  let aCh = 0;
  let bCh = 0;

  for (let i = 0; i < aLen; ++i) {
    if (i <= bLen) {
      aCh = aPath.charCodeAt(i);
      bCh = bPath.charCodeAt(i);
      if (aCh < bCh) {
        return -1;
      } else if (aCh > bCh) {
        return 1;
      }
    } else {
      return 1;
    }
  }
  return -1;
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
    const fs = this.fs;
    const logger = this.logger;

    const root = resolve(__dirname, '..', '..', '..', 'test262');

    const testDir = join(root, 'test');
    const languageDir = join(testDir, 'language');

    const harnessDir = join(root, 'harness');
    const harnessFiles = await fs.getFiles(harnessDir, true);
    const staFile = harnessFiles.find(x => x.name === 'sta.js');
    const assertFile = harnessFiles.find(x => x.name === 'assert.js');
    const prerequisites = [staFile, assertFile];

    const now = PLATFORM.now();
    logger.info(`Loading test files from ${languageDir}`);

    const files = (await fs.getFiles(languageDir)).filter(x => !x.shortName.endsWith('FIXTURE'));

    logger.info(`Discovered ${files.length} test files in ${Math.round(PLATFORM.now() - now)}ms`);

    const testCases = files
      .slice()
      .sort(compareFiles)
      .map(x => new TestCase(this.container, logger, x, prerequisites));

    for (const tc of testCases) {
      if (tc.meta != null && tc.meta.negative != null) {
        // These error types should be caught by typescript
        if (tc.meta.negative.phase === 'early' || tc.meta.negative.phase === 'parse') {
          continue;
        }

        if (excludedFeatures.some(x => tc.meta.features.includes(x))) {
          continue;
        }
      }
      const result = await tc.run();

      if (tc.meta.negative === null) {
        if (result.last.err === null) {
          logger.info(`${format.green('PASS')} - ${tc.file.rootlessPath}`);
        } else {
          logger.info(`${format.red('FAIL')} - ${tc.file.rootlessPath} (expected no error, but got: ${result.last.err.message} ${result.last.err.stack})`);
        }
      } else {
        if (result.last.err === null) {
          logger.info(`${format.red('FAIL')} - ${tc.file.rootlessPath} (expected error ${tc.meta.negative.type}, but got none)`);
        } else if (result.last.err.name !== tc.meta.negative.type) {
          logger.info(`${format.red('FAIL')} - ${tc.file.rootlessPath} (expected error ${tc.meta.negative.type}, but got: ${result.last.err.name})`);
        } else {
          logger.info(`${format.green('PASS')} - ${tc.file.rootlessPath}`);
        }
      }
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
