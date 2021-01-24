import { BenchmarkMeasurements, Measurement, totalDuration } from '@benchmarking-apps/test-result';
import { bindable, customElement, ILogger } from 'aurelia';
import template from './by-browsers.html';
import { VersionedItem } from './shared';
import { SmallMultiples } from './small-multiples';
import { StackedBars } from './stacked-bars';

@customElement({
  name: 'by-browsers',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [
    StackedBars,
    SmallMultiples,
  ],
})
export class ByBrowsers {
  @bindable public readonly data: BenchmarkMeasurements;
  private avgDataset: AvgMeasurement[];
  private readonly measurementIdentifier: (m: AvgMeasurement | Measurement) => string = function (m) { return (m as AvgMeasurement).id ?? `${m.framework}@${m.frameworkVersion}`; };
  private readonly totalDurationFn: (m: AvgMeasurement | Measurement) => number = function (m) { return m.totalDuration; };
  private browsers: VersionedItem[];
  private activeBrowser: VersionedItem | undefined;

  public constructor(
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('ByBrowsers');
  }

  public binding(): void {
    const browsers: VersionedItem[] = this.browsers = [];
    const measurements = this.data.measurements;
    for (const m of measurements) {
      const br = m.browser;
      const brVer = m.browserVersion;
      if (browsers.find((b) => b.name === br && b.version === brVer) === void 0) {
        browsers.push(new VersionedItem(br, brVer));
      }
    }
    const numBrowsers = browsers.length;
    if (numBrowsers === 1) {
      this.activeBrowser = browsers[0];
    } else if (numBrowsers > 1) {
      this.computeAverageDataset();
    }
  }

  private computeAverageDataset() {
    const avgDataset: AvgMeasurement[] = this.avgDataset = [];
    for (const item of this.data.measurements) {
      let avg = avgDataset.find((i) => i.framework === item.framework
        && i.frameworkVersion === item.frameworkVersion
        && i.initialPopulation === item.initialPopulation
        && i.totalPopulation === item.totalPopulation
      );
      if (avg === void 0) {
        avg = new AvgMeasurement(item);
        avgDataset.push(avg);
      } else {
        avg.add(item);
      }
    }
    this.logger.debug('avgDataset', avgDataset);
  }

  private getActiveBrowserDataset() {
    const browser = this.activeBrowser;
    return this.data.measurements
      .filter((m) => m.browser === browser.name && m.browserVersion === browser.version);
  }
}
class AvgMeasurement implements Omit<Measurement, 'browser' | 'browserVersion' | 'name' | 'isValid'> {

  public readonly id: string;
  public readonly framework: string;
  public readonly frameworkVersion: string;
  public readonly initialPopulation: number;
  public readonly totalPopulation: number;

  public durationInitialLoad: number = 0;
  public durationPopulation: number = 0;
  public durationUpdate: number = 0;
  public durationShowDetails: number = 0;
  public durationHideDetails: number = 0;
  public durationLocaleDe: number = 0;
  public durationLocaleEn: number = 0;
  public durationSortFirstName: number = 0;
  public durationSortFirstNameDesc: number = 0;
  public durationSortLastName: number = 0;
  public durationSortLastNameDesc: number = 0;
  public durationSortDob: number = 0;
  public durationSortDobDesc: number = 0;
  public durationFilterEmployed: number = 0;
  public durationFilterUnemployed: number = 0;
  public durationFilterNone: number = 0;
  public durationSelectFirst: number = 0;
  public durationDeleteFirst: number = 0;
  public durationDeleteAll: number = 0;

  private count = 0;
  @totalDuration
  public readonly totalDuration!: number;

  public constructor(
    measurement: Measurement
  ) {
    const fx = measurement.framework;
    const fxVer = measurement.frameworkVersion;
    const p0 = measurement.initialPopulation;
    const pn = measurement.totalPopulation;
    this.framework = fx;
    this.frameworkVersion = fxVer;
    this.initialPopulation = p0;
    this.totalPopulation = pn;
    this.id = `${fx}@${fxVer}`;
    this.add(measurement);
  }

  public add(measurement: Measurement) {
    const n = this.count;
    const n1 = ++this.count;
    for (const [key, value] of Object.entries(measurement)) {
      if (!key.startsWith('duration') || value === void 0) { continue; }
      this[key] = ((this[key] as number * n) + value) / n1;
    }
  }
}
