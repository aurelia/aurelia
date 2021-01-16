/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { v4 as uuid } from 'uuid';
import { getNewStorageFor, IStorage, StorageConfig, Storages } from '@benchmarking-apps/test-result';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

type Writable<TClass> = { -readonly [key in keyof TClass]: TClass[key] };
// eslint-disable-next-line @typescript-eslint/ban-types
type DataMembers<TClass> = { [key in keyof TClass]: TClass[key] extends Function ? never : key }[keyof TClass];
export type Data<TClass> = { [key in DataMembers<TClass>]: TClass[key] };

export class FrameworkMetadata {
  /**
   * @param {string} name - Unique name identifying the framework.
   * @param {string} localPath - Local path to the app relative to this runner npm module root.
   * @param {string} port - Unique port where the app will hosted.
   */
  public constructor(
    public readonly name: string,
    public readonly version: string,
    public readonly localPath: string,
    public readonly port: string,
  ) { }
}

// Register new frameworks here
export const frameworksMetadata: Record<string, FrameworkMetadata> = {
  aurelia2: new FrameworkMetadata(
    /* name         */'aurelia2',
    /* version      */'local',
    /* localPath    */'../aurelia2',
    /* port         */'9000',
  ),
  aurelia2_npm: new FrameworkMetadata(
    /* name         */'aurelia2_npm',
    /* version      */'0.8.0',
    /* localPath    */'../aurelia2-npm',
    /* port         */'9001',
  ),
} as const;

export class BenchOptions {
  private constructor(
    public readonly batchId: string,
    public readonly iterations: number,
    public readonly frameworks: FrameworkMetadata[],
    public readonly storage: IStorage,
  ) { }

  public toString(): string {
    return `BenchOptions(iterations=${this.iterations},frameworks=${this.frameworks.map((fx) => fx.name).join(',')},storage=${this.storage.type})`;
  }
  public static readonly instance: BenchOptions;

  public static create(
    batchId: string,
    iterations: number,
    frameworks: FrameworkMetadata[],
    storage: IStorage,
  ): BenchOptions {
    if (this.instance !== void 0) {
      throw new Error('BenchOption is already created');
    }
    return (this as Writable<typeof BenchOptions>).instance = new BenchOptions(batchId, iterations, frameworks, storage);
  }

  public static async createFromCliArgs(): Promise<BenchOptions> {
    const defaultIterations = 100;
    const args = process.argv.slice(2);
    let iterations = defaultIterations;
    let storage = Storages.json;
    let frameworks: FrameworkMetadata[] = [];
    for (let i = 0, ii = args.length; i < ii; i += 2) {
      const value = args[i + 1];

      switch (args[i]) {
        case '--i':
          iterations = Number(value);
          break;
        case '--fx': {
          const data: FrameworkMetadata = frameworksMetadata[value];
          if (data === void 0) {
            throw new Error(`Framework '${value}' not registered`);
          }
          if (!frameworks.includes(data)) {
            frameworks.push(data);
          }
          break;
        }
        case '--storage': {
          switch (value) {
            case 'json':
              storage = Storages.json;
              break;
            case 'cosmos':
              storage = Storages.cosmos;
              break;
            default:
              throw new Error(`Unsupported storage option ${value}`);
          }
          break;
        }
      }
    }

    if (Number.isNaN(iterations)) {
      iterations = defaultIterations;
      console.warn(`invalid value for iterations; using the default value ${iterations}`);
    }

    if (frameworks.length === 0) {
      console.warn('No framework filter given; running benchmark for all frameworks.');
      frameworks = Array.from(Object.values(frameworksMetadata));
    }

    const cosmosConfigPath = join(process.cwd(), 'cosmos.config.json');
    const options: StorageConfig = {
      resultRoot: join(process.cwd(), '..', '.results'),
      ...(existsSync(cosmosConfigPath)
        ? JSON.parse(readFileSync(cosmosConfigPath, 'utf8'))
        : {})
    };
    return BenchOptions.create(uuid(), iterations, frameworks, getNewStorageFor(storage, options));
  }
}
