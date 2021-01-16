import { CosmosClient } from '@azure/cosmos';
import { join, extname } from 'path';
import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'fs';

function roundDurationMs(val: number) { return Math.round(val * 1e3) / 1e3; }
export const browserTypes = ['chromium', 'firefox', 'webkit'] as const; // TODO: Enable the rest as soon as the container image (in CI) is fixed.
export type BrowserType = typeof browserTypes[number];

export interface BenchmarkMetadata {
  ts_start: number;
  ts_end: number;
  branch: string;
  commit: string;
}

export class BenchmarkMeasurements implements BenchmarkMetadata {

  public static create(value: string | Partial<BenchmarkMeasurements>): BenchmarkMeasurements {
    if (typeof value === 'string') {
      value = JSON.parse(value) as Partial<BenchmarkMeasurements>;
    }
    return new BenchmarkMeasurements(
      /* id           */ value.id!,
      /* ts_start     */ value.ts_start!,
      /* ts_end       */ value.ts_end!,
      /* branch       */ value.branch!,
      /* commit       */ value.commit!,
      /* measurements */ value.measurements?.map(Measurement.create),
    );
  }

  public constructor(
    public readonly id: string,
    public readonly ts_start: number,
    public readonly ts_end: number,
    public readonly branch: string,
    public readonly commit: string,
    public readonly measurements: Measurement[] = [],
  ) { }

  public isValid(): boolean {
    return (
      typeof this.id === 'string' &&
      Number.isFinite(this.ts_start) &&
      Number.isFinite(this.ts_end) &&
      typeof this.branch === 'string' &&
      typeof this.commit === 'string' &&
      this.measurements.every(isValid)
    );
  }
}

function isValid(m: Measurement): boolean {
  return m.isValid();
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

  public static create(value: Partial<Measurement>): Measurement {
    const measurement = new Measurement(
      /* framework         */ value.framework!,
      /* frameworkVersion  */ value.frameworkVersion!,
      /* browser           */ value.browser!,
      /* browserVersion    */ value.browserVersion!,
      /* initialPopulation */ value.initialPopulation!,
      /* totalPopulation   */ value.totalPopulation!,
    );
    measurement.durationInitialLoad = value.durationInitialLoad!;
    measurement.durationPopulation = value.durationPopulation!;
    measurement.durationUpdate = value.durationUpdate!;
    measurement.durationShowDetails = value.durationShowDetails!;
    measurement.durationHideDetails = value.durationHideDetails!;
    measurement.durationLocaleDe = value.durationLocaleDe!;
    measurement.durationLocaleEn = value.durationLocaleEn!;
    measurement.durationSortFirstName = value.durationSortFirstName!;
    measurement.durationSortFirstNameDesc = value.durationSortFirstNameDesc!;
    measurement.durationSortLastName = value.durationSortLastName!;
    measurement.durationSortLastNameDesc = value.durationSortLastNameDesc!;
    measurement.durationSortDob = value.durationSortDob!;
    measurement.durationSortDobDesc = value.durationSortDobDesc!;
    measurement.durationFilterEmployed = value.durationFilterEmployed!;
    measurement.durationFilterUnemployed = value.durationFilterUnemployed!;
    measurement.durationFilterNone = value.durationFilterNone!;
    measurement.durationSelectFirst = value.durationSelectFirst!;
    measurement.durationDeleteFirst = value.durationDeleteFirst!;
    measurement.durationDeleteAll = value.durationDeleteAll!;
    return measurement;
  }

  public isValid(): boolean {
    return (
      typeof this.framework === 'string' &&
      typeof this.frameworkVersion === 'string' &&
      typeof this.browser === 'string' &&
      typeof this.browserVersion === 'string' &&

      Number.isFinite(this.initialPopulation) &&
      Number.isFinite(this.totalPopulation) &&

      Number.isFinite(this.durationInitialLoad) &&
      Number.isFinite(this.durationPopulation) &&
      Number.isFinite(this.durationUpdate) &&
      Number.isFinite(this.durationShowDetails) &&
      Number.isFinite(this.durationHideDetails) &&
      Number.isFinite(this.durationLocaleDe) &&
      Number.isFinite(this.durationLocaleEn) &&
      Number.isFinite(this.durationSortFirstName) &&
      Number.isFinite(this.durationSortFirstNameDesc) &&
      Number.isFinite(this.durationSortLastName) &&
      Number.isFinite(this.durationSortLastNameDesc) &&
      Number.isFinite(this.durationSortDob) &&
      Number.isFinite(this.durationSortDobDesc) &&
      Number.isFinite(this.durationFilterEmployed) &&
      Number.isFinite(this.durationFilterUnemployed) &&
      Number.isFinite(this.durationFilterNone) &&
      Number.isFinite(this.durationSelectFirst) &&
      Number.isFinite(this.durationDeleteFirst) &&
      Number.isFinite(this.durationDeleteAll)
    );
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
  addMeasurements(...measurements: Measurement[]): void;
  persist(batchId: string, metadata?: BenchmarkMetadata): void | Promise<void>;
  getLatestBenchmarkResult(branch?: string): Promise<Partial<BenchmarkMeasurements>>;
  getAllBenchmarkResults(): Promise<Partial<BenchmarkMeasurements>[]>;
}
class JsonFileStorage implements IStorage {
  public readonly type: 'json' = 'json';
  public readonly measurements: Measurement[] = [];

  public constructor(
    public readonly resultRoot: string,
  ) {
    if (!resultRoot) {
      throw new Error('Missing result root path.');
    }
  }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public persist(batchId: string, metadata: BenchmarkMetadata): void {
    const fileName = join(this.resultRoot, `${batchId}.json`);
    writeFileSync(fileName, JSON.stringify({
      ...metadata,
      measurements: this.measurements,
    }, undefined, 2), 'utf8');
    console.log(`The results are written to ${fileName}.`);
  }

  public getLatestBenchmarkResult(): Promise<Partial<BenchmarkMeasurements>> {
    let latestResult, timestamp = -1;
    const root = this.resultRoot;
    for (const file of readdirSync(root, 'utf8')) {
      if (extname(file) !== '.json') { continue; }
      const filePath = join(root, file);
      const stat = lstatSync(filePath);
      const newTimestamp = Math.max(timestamp, stat.ctime.getTime());
      if (newTimestamp !== timestamp) {
        timestamp = newTimestamp;
        latestResult = filePath;
      }
    }
    if (latestResult === void 0) {
      throw new Error('No benchmark result found');
    }
    return Promise.resolve(JSON.parse(readFileSync(latestResult, 'utf8')) as Partial<BenchmarkMeasurements>);
  }

  public async getAllBenchmarkResults(): Promise<Partial<BenchmarkMeasurements>[]> {
    const results: Partial<BenchmarkMeasurements>[] = [];
    const root = this.resultRoot;
    for (const file of readdirSync(root, 'utf8')) {
      if (extname(file) !== '.json') { continue; }
      results.push(JSON.parse(readFileSync(join(root, file), 'utf8')));
    }
    return Promise.resolve(results);
  }
}
class CosmosStorage implements IStorage {
  public readonly type: 'cosmos' = 'cosmos';
  public readonly measurements: Measurement[] = [];
  private readonly client: CosmosClient;

  public constructor(
    endpoint: string,
    key: string,
  ) {
    if (!endpoint || !key) {
      throw new Error('Missing cosmos endpoint or key.');
    }
    this.client = new CosmosClient({ endpoint, key });
  }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public async persist(batchId: string, metadata: BenchmarkMetadata): Promise<void> {
    const database = (await this.client.databases.createIfNotExists({ id: 'benchmarks' })).database;
    const container = (await database.containers.createIfNotExists({ id: 'measurements' })).container;
    await container.items.create({
      ...metadata,
      id: batchId,
      measurements: this.measurements,
    });
    console.log(`Persisted the result for batch ${batchId} in cosmos DB.`);
  }

  // Maybe we need a list of branches for comparison. But then we need to think about the viz to use to compare branches.
  public async getLatestBenchmarkResult(branch: string = 'master'): Promise<Partial<BenchmarkMeasurements>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const measurements = (await this.client
      .database('benchmarks')
      .container('measurements')
      .items
      .query(`SELECT * FROM measurements m WHERE m.branch = "${branch}" ORDER BY m.ts_start DESC LIMIT 1`)
      .fetchAll()
    ).resources[0];
    if (measurements === void 0) {
      throw new Error('No benchmark result found');
    }
    return measurements as Partial<BenchmarkMeasurements>;
  }

  public async getAllBenchmarkResults(): Promise<Partial<BenchmarkMeasurements>[]> {
    return (await this.client
      .database('benchmarks')
      .container('measurements')
      .items
      .readAll()
      .fetchAll()
    ).resources;
  }
}

export function getNewStorageFor(
  storage: Storages,
  options: StorageConfig,
): IStorage {
  switch (storage) {
    case Storages.json:
      return new JsonFileStorage(options.resultRoot!);
    case Storages.cosmos:
      return new CosmosStorage(options.cosmosEndpoint!, options.cosmosKey!);
  }
}
