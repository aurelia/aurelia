function roundDurationMs(val: number) { return Math.round(val * 1e3) / 1e3; }
export const browserTypes = ['chromium'/* , 'firefox', 'webkit' */] as const; // TODO: Enable the rest as soon as the container image (in CI) is fixed.

export type BrowserType = typeof browserTypes[number];

export interface BenchmarkMetadata {
  ts_start: number;
  ts_end: number;
  branch: string;
  commit: string;
}

export class BenchmarkMeasurements implements BenchmarkMetadata {

  public static create(value: string | Partial<BenchmarkMeasurements>, localOnly: boolean = false): BenchmarkMeasurements {
    if (typeof value === 'string') {
      value = JSON.parse(value) as Partial<BenchmarkMeasurements>;
    }
    return new BenchmarkMeasurements(
        /* id           */ value.id!,
        /* ts_start     */ value.ts_start!,
        /* ts_end       */ value.ts_end!,
        /* branch       */ value.branch!,
        /* commit       */ value.commit!,
        /* measurements */ localOnly
        ? value.measurements?.reduce((acc: Measurement[], m) => {
          if (m.framework === 'aurelia2' && m.frameworkVersion === 'local') {
            acc.push(Measurement.create(m));
          }
          return acc;
        }, [])
        : value.measurements?.map(Measurement.create)
    );
  }

  public constructor(
    public readonly id: string,
    public readonly ts_start: number,
    public readonly ts_end: number,
    public readonly branch: string,
    public readonly commit: string,
    public readonly measurements: Measurement[] = []
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
  public durationConditional: number = Number.POSITIVE_INFINITY;
  public durationTextUpdate: number = Number.POSITIVE_INFINITY;
  public durationSorting: number = Number.POSITIVE_INFINITY;
  public durationFilter: number = Number.POSITIVE_INFINITY;

  public durationSelectFirst: number = Number.POSITIVE_INFINITY;
  public durationDeleteFirst: number = Number.POSITIVE_INFINITY;
  public durationDeleteAll: number = Number.POSITIVE_INFINITY;

  @totalDuration
  public readonly totalDuration!: number;

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
      this.durationConditional = 0;
      this.durationTextUpdate = 0;
      this.durationSorting = 0;
      this.durationFilter = 0;

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
        /* totalPopulation   */ value.totalPopulation!
    );
    measurement.durationInitialLoad = value.durationInitialLoad!;
    measurement.durationPopulation = value.durationPopulation!;
    measurement.durationUpdate = value.durationUpdate!;
    measurement.durationConditional = value.durationConditional!;
    measurement.durationTextUpdate = value.durationTextUpdate!;
    measurement.durationSorting = value.durationSorting!;
    measurement.durationFilter = value.durationFilter!;

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
      Number.isFinite(this.durationConditional) &&
      Number.isFinite(this.durationTextUpdate) &&
      Number.isFinite(this.durationSorting) &&
      Number.isFinite(this.durationFilter) &&
      Number.isFinite(this.durationSelectFirst) &&
      Number.isFinite(this.durationDeleteFirst) &&
      Number.isFinite(this.durationDeleteAll)
    );
  }
}

export type WritableMeasurement = Omit<Measurement, 'framework' | 'frameworkVersion' | 'browser' | 'browserVersion' | 'initialPopulation' | 'totalPopulation' | 'name' | 'totalDuration'>;
export type WritableMeasurementKeys = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key in keyof WritableMeasurement]: Measurement[key] extends Function ? never : key;
}[keyof WritableMeasurement];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function totalDuration(target: Partial<Measurement>, property: string): any {
  const _internal = Symbol(`_${property}`);
  return {
    get(this: Partial<Measurement>): number {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      let totalDuration: number = (this as any)[_internal];
      if (totalDuration !== void 0) { return totalDuration; }

      totalDuration = 0;
      for (const [key, value] of Object.entries(this)) {
        if (!key.startsWith('duration') || value === void 0) { continue; }
        totalDuration += value as number;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      return (this as any)[_internal] = totalDuration;
    },
  };
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
      mean.durationConditional += item.durationConditional;
      mean.durationTextUpdate += item.durationTextUpdate;
      mean.durationSorting += item.durationSorting;
      mean.durationFilter += item.durationFilter;
      mean.durationSelectFirst += item.durationSelectFirst;
      mean.durationDeleteFirst += item.durationDeleteFirst;
      mean.durationDeleteAll += item.durationDeleteAll;
    }

    mean.durationInitialLoad = roundDurationMs(mean.durationInitialLoad / length);
    if (mean.initialPopulation === 0) {
      mean.durationPopulation! = roundDurationMs(mean.durationPopulation! / length);
    }
    mean.durationUpdate = roundDurationMs(mean.durationUpdate / length);
    mean.durationConditional = roundDurationMs(mean.durationConditional / length);
    mean.durationTextUpdate = roundDurationMs(mean.durationTextUpdate / length);
    mean.durationSorting = roundDurationMs(mean.durationSorting / length);
    mean.durationFilter = roundDurationMs(mean.durationFilter / length);
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

export interface IStorage {
  type: 'json' | 'cosmos';
  measurements: Measurement[];
  addMeasurements(...measurements: Measurement[]): void;
  persist(batchId: string, metadata?: BenchmarkMetadata): void | Promise<void>;
  getLatestBenchmarkResult(branch?: string, commit?: string): Promise<Partial<BenchmarkMeasurements>>;
  getAllBenchmarkResults(): Promise<Partial<BenchmarkMeasurements>[]>;
}
