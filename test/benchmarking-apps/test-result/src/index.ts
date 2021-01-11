import { CosmosClient } from '@azure/cosmos';
import { join } from 'path';
import { writeFileSync } from 'fs';

function roundDurationMs(val: number) { return Math.round(val * 1e3) / 1e3; }
export const browserTypes = ['chromium', 'firefox', 'webkit'] as const; // TODO: Enable the rest as soon as the container image (in CI) is fixed.
export type BrowserType = typeof browserTypes[number];

export interface BenchmarkMetadata {
  ts_start: number;
  ts_end: number;
  branch: string;
  commit: string;
}

export interface BenchmarkMeasurements extends BenchmarkMetadata {
  id: string;
  measurements: Measurement[];
}

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
    initializeWithZero = false
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

export type WritableMeasurement = Omit<Measurement, 'framework' | 'frameworkVersion' | 'browser' | 'browserVersion' | 'initialPopulation' | 'totalPopulation' | 'name'>;
export type WritableMeasurementKeys = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key in keyof WritableMeasurement]: Measurement[key] extends Function ? never : key
}[keyof WritableMeasurement];

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

export interface StorageConfig {
  /**
   * Unique identifier for a benchmarking batch.
   */
  batchId: string;
  /**
   * Absolute root path for the local json file storage to persist the results.
   * Required when using the local json file storage.
   */
  resultRoot?: string;
  /**
   * Cosmos endpoint to use when using the cosmos file storage.
   * Required when using the cosmos file storage.
   */
  cosmosEndpoint?: string;
  /**
   * Cosmos key to use when using the cosmos file storage.
   * Required when using the cosmos file storage.
   */
  cosmosKey?: string;
}
export enum Storages {
  json,
  cosmos
}

export interface IStorage {
  type: 'json' | 'cosmos';
  measurements: Measurement[];
  batchId: string;
  addMeasurements(...measurements: Measurement[]): void;
  persist(metadata?: BenchmarkMetadata): void | Promise<void>;
  getAllBenchmarkResults(): Promise<BenchmarkMeasurements[]>; // TODO: enable query support
}
class JsonFileStorage implements IStorage {
  public readonly type: 'json' = 'json';
  public readonly measurements: Measurement[] = [];

  public constructor(
    public readonly batchId: string,
    public readonly resultRoot: string,
  ) {
    if (!batchId) {
      throw new Error('Missing batchId.');
    }
    if (!resultRoot) {
      throw new Error('Missing result root path.');
    }
  }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public persist(metadata: BenchmarkMetadata): void {
    const fileName = join(this.resultRoot, `${this.batchId}.json`);
    writeFileSync(fileName, JSON.stringify({
      ...metadata,
      measurements: this.measurements,
    }, undefined, 2), 'utf8');
    console.log(`The results are written to ${fileName}.`);
  }

  public getAllBenchmarkResults(): Promise<BenchmarkMeasurements[]> {
    throw new Error('Method not implemented.');
  }
}
class CosmosStorage implements IStorage {
  public readonly type: 'cosmos' = 'cosmos';
  public readonly measurements: Measurement[] = [];
  private readonly client: CosmosClient;

  public constructor(
    public readonly batchId: string,
    endpoint: string,
    key: string,
  ) {
    if (!batchId) {
      throw new Error('Missing batchId.');
    }
    if (!endpoint || !key) {
      throw new Error('Missing cosmos endpoint or key.');
    }
    this.client = new CosmosClient({ endpoint, key });
  }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public async persist(metadata: BenchmarkMetadata): Promise<void> {
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

  public async getAllBenchmarkResults(): Promise<BenchmarkMeasurements[]> {
    return (await this.client
      .database('benchmarks')
      .container('measurements')
      .items
      .readAll()
      .fetchAll()
    ).resources as BenchmarkMeasurements[];
  }
}

export function getNewStorageFor(
  storage: Storages,
  options: StorageConfig,
): IStorage {
  switch (storage) {
    case Storages.json:
      return new JsonFileStorage(options.batchId, options.resultRoot!);
    case Storages.cosmos:
      return new CosmosStorage(options.batchId, options.cosmosEndpoint!, options.cosmosKey!);
  }
}
