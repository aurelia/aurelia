/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CosmosClient } from '@azure/cosmos';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { v4 as uuid } from 'uuid';

type Writable<TClass> = { -readonly [key in keyof TClass]: TClass[key] };
// eslint-disable-next-line @typescript-eslint/ban-types
type DataMembers<TClass> = { [key in keyof TClass]: TClass[key] extends Function ? never : key }[keyof TClass];
export type Data<TClass> = { [key in DataMembers<TClass>]: TClass[key] };

export const browserTypes = ['chromium',  /* 'firefox', 'webkit' */] as const; // TODO: Enable the rest as soon as the container image (in CI) is fixed.
export type BrowserType = typeof browserTypes[number];
function roundDurationMs(val: number) { return Math.round(val * 1e3) / 1e3; }

export type WritableMeasurement = Omit<Measurement, 'framework' | 'frameworkVersion' | 'browser' | 'browserVersion' | 'initialPopulation' | 'totalPopulation' | 'name'>;
export type WritableMeasurementKeys = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key in keyof WritableMeasurement]: Measurement[key] extends Function ? never : key
}[keyof WritableMeasurement];

export class Measurement {
  public durationInitialLoad: number = Number.POSITIVE_INFINITY;
  public durationPopulation: number | undefined = void 0;
  public durationUpdate: number = Number.POSITIVE_INFINITY;
  public durationShowDetails: number = Number.POSITIVE_INFINITY;
  public durationHideDetails: number = Number.POSITIVE_INFINITY;
  public durationLocaleDe: number = Number.POSITIVE_INFINITY;
  public durationLocaleEn: number = Number.POSITIVE_INFINITY;
  public durationSortFirstName: number = Number.POSITIVE_INFINITY;
  public durationSortFirstNameDesc: number = Number.POSITIVE_INFINITY;
  public durationSortLastName: number = Number.POSITIVE_INFINITY;
  public durationSortLastNameDesc: number = Number.POSITIVE_INFINITY;
  public durationSortDob: number = Number.POSITIVE_INFINITY;
  public durationSortDobDesc: number = Number.POSITIVE_INFINITY;
  public durationFilterEmployed: number = Number.POSITIVE_INFINITY;
  public durationFilterUnemployed: number = Number.POSITIVE_INFINITY;
  public durationFilterNone: number = Number.POSITIVE_INFINITY;
  public durationSelectFirst: number = Number.POSITIVE_INFINITY;
  public durationDeleteFirst: number = Number.POSITIVE_INFINITY;
  public durationDeleteAll: number = Number.POSITIVE_INFINITY;

  public get name(): string {
    return `${this.framework} - ${this.browser} - ${this.initialPopulation} - ${this.totalPopulation}`;
  }
  public constructor(
    public readonly framework: string,
    public readonly frameworkVersion: string,
    public readonly browser: BrowserType,
    public readonly browserVersion: string,
    public readonly initialPopulation: number,
    public readonly totalPopulation: number,
    initializeWithZero = false,
  ) {
    if (initializeWithZero) {
      this.durationInitialLoad = 0;
      this.durationUpdate = 0;
      this.durationShowDetails = 0;
      this.durationHideDetails = 0;
      this.durationLocaleDe = 0;
      this.durationLocaleEn = 0;
      this.durationSortFirstName = 0;
      this.durationSortFirstNameDesc = 0;
      this.durationSortLastName = 0;
      this.durationSortLastNameDesc = 0;
      this.durationSortDob = 0;
      this.durationSortDobDesc = 0;
      this.durationFilterEmployed = 0;
      this.durationFilterUnemployed = 0;
      this.durationFilterNone = 0;
      this.durationSelectFirst = 0;
      this.durationDeleteFirst = 0;
      this.durationDeleteAll = 0;
    }
  }
}

export class Measurements extends Array<Measurement> {

  public get means(): Measurement[] {
    return this.getGroups().map((measurements) => measurements.mean);
  }

  private getGroups(): Measurements[] {
    const map = new Map<string, Measurements>();
    for (const measurement of this) {
      const name = measurement.name;
      let measurements = map.get(name);
      if (measurements === void 0) {
        map.set(name, measurements = new Measurements());
      }
      measurements.push(measurement);
    }
    return Array.from(map.values());
  }

  public get mean(): Measurement {
    const item0 = this[0];
    const mean = new Measurement(item0.framework, item0.frameworkVersion, item0.browser, item0.browserVersion, item0.initialPopulation, item0.totalPopulation, true);
    const length = this.length;
    for (let i = 0, ii = length; i < ii; i++) {
      const item = this[i];
      mean.durationInitialLoad += item.durationInitialLoad;
      if (mean.initialPopulation === 0) {
        if (mean.durationPopulation === void 0) {
          mean.durationPopulation = 0;
        }
        mean.durationPopulation! += item.durationPopulation!;
      }
      mean.durationUpdate += item.durationUpdate;
      mean.durationShowDetails += item.durationShowDetails;
      mean.durationHideDetails += item.durationHideDetails;
      mean.durationLocaleDe += item.durationLocaleDe;
      mean.durationLocaleEn += item.durationLocaleEn;
      mean.durationSortFirstName += item.durationSortFirstName;
      mean.durationSortFirstNameDesc += item.durationSortFirstNameDesc;
      mean.durationSortLastName += item.durationSortLastName;
      mean.durationSortLastNameDesc += item.durationSortLastNameDesc;
      mean.durationSortDob += item.durationSortDob;
      mean.durationSortDobDesc += item.durationSortDobDesc;
      mean.durationFilterEmployed += item.durationFilterEmployed;
      mean.durationFilterUnemployed += item.durationFilterUnemployed;
      mean.durationFilterNone += item.durationFilterNone;
      mean.durationSelectFirst += item.durationSelectFirst;
      mean.durationDeleteFirst += item.durationDeleteFirst;
      mean.durationDeleteAll += item.durationDeleteAll;
    }

    mean.durationInitialLoad = roundDurationMs(mean.durationInitialLoad / length);
    if (mean.initialPopulation === 0) {
      mean.durationPopulation! = roundDurationMs(mean.durationPopulation! / length);
    }
    mean.durationUpdate = roundDurationMs(mean.durationUpdate / length);
    mean.durationShowDetails = roundDurationMs(mean.durationShowDetails / length);
    mean.durationHideDetails = roundDurationMs(mean.durationHideDetails / length);
    mean.durationLocaleDe = roundDurationMs(mean.durationLocaleDe / length);
    mean.durationLocaleEn = roundDurationMs(mean.durationLocaleEn / length);
    mean.durationSortFirstName = roundDurationMs(mean.durationSortFirstName / length);
    mean.durationSortFirstNameDesc = roundDurationMs(mean.durationSortFirstNameDesc / length);
    mean.durationSortLastName = roundDurationMs(mean.durationSortLastName / length);
    mean.durationSortLastNameDesc = roundDurationMs(mean.durationSortLastNameDesc / length);
    mean.durationSortDob = roundDurationMs(mean.durationSortDob / length);
    mean.durationSortDobDesc = roundDurationMs(mean.durationSortDobDesc / length);
    mean.durationFilterEmployed = roundDurationMs(mean.durationFilterEmployed / length);
    mean.durationFilterUnemployed = roundDurationMs(mean.durationFilterUnemployed / length);
    mean.durationFilterNone = roundDurationMs(mean.durationFilterNone / length);
    mean.durationSelectFirst = roundDurationMs(mean.durationSelectFirst / length);
    mean.durationDeleteFirst = roundDurationMs(mean.durationDeleteFirst / length);
    mean.durationDeleteAll = roundDurationMs(mean.durationDeleteAll / length);

    return mean;
  }
}

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
  // The following can only be activated after the PR #1021 is merged.
  // aurelia2_npm: new FrameworkMetadata(
  //   /* name         */'aurelia2_npm',
  //   /* version      */'0.8.0',
  //   /* localPath    */'../aurelia2-npm',
  //   /* port         */'9001',
  // ),
} as const;

export class BenchOptions {
  private constructor(
    public readonly iterations: number,
    public readonly frameworks: FrameworkMetadata[],
    public readonly storage: IStorage,
  ) { }

  public toString(): string {
    return `BenchOptions(iterations=${this.iterations},frameworks=${this.frameworks.map((fx) => fx.name).join(',')},storage=${this.storage.type})`;
  }
  public static readonly instance: BenchOptions;

  public static create(
    iterations: number,
    frameworks: FrameworkMetadata[],
    storage: IStorage,
  ): BenchOptions {
    if (this.instance !== void 0) {
      throw new Error('BenchOption is already created');
    }
    return (this as Writable<typeof BenchOptions>).instance = new BenchOptions(iterations, frameworks, storage);
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
    return BenchOptions.create(iterations, frameworks, getNewStorageFor(storage, uuid()));
  }
}

export enum Storages {
  json,
  cosmos,
}

export interface IStorage {
  type: 'json' | 'cosmos';
  measurements: Measurement[];
  batchId: string;
  addMeasurements(...measurements: Measurement[]): void;
  persist(metadata?: Record<string, unknown>): void | Promise<void>;
}

class JsonFileStorage implements IStorage {
  public readonly type: 'json' = 'json';
  public readonly measurements: Measurement[] = [];

  public constructor(
    public readonly batchId: string,
  ) { }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public persist(metadata: Record<string, unknown> = {}): void {
    const fileName = join(process.cwd(), '.bench-results', `${this.batchId}.json`);
    writeFileSync(fileName, JSON.stringify({
      ...metadata,
      measurements: this.measurements,
    }, undefined, 2), 'utf8');
    console.log(`The results are written to ${fileName}.`);
  }
}

interface CosmosConfig {
  endpoint: string;
  key: string;
}

class CosmosStorage implements IStorage {
  public readonly type: 'cosmos' = 'cosmos';
  public readonly measurements: Measurement[] = [];
  private readonly client: CosmosClient;

  public constructor(
    public readonly batchId: string,
  ) {
    // This file is generated by the CI
    const configFile = join(process.cwd(), 'cosmos.config.json');
    const cosmosConfig: CosmosConfig = JSON.parse(readFileSync(configFile, 'utf8'));
    this.client = new CosmosClient({
      endpoint: cosmosConfig.endpoint,
      key: cosmosConfig.key
    });
  }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public async persist(metadata: Record<string, unknown> = {}): Promise<void> {
    const database = (await this.client.databases.createIfNotExists({ id: 'benchmarks' })).database;
    const container = (await database.containers.createIfNotExists({ id: 'measurements' })).container;
    const batchId = this.batchId;
    await container.items.create({
      ...metadata,
      id: batchId,
      measurements: this.measurements,
    });
    console.log(`Persisted the result for batch ${batchId} in cosmos DB.`);
  }
}

export function getNewStorageFor(storage: Storages, batchId: string): IStorage {
  switch (storage) {
    case Storages.json:
      return new JsonFileStorage(batchId);
    case Storages.cosmos:
      return new CosmosStorage(batchId);
  }
}
