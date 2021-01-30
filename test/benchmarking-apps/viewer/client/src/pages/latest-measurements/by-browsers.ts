import { BenchmarkMeasurements, Measurement } from '@benchmarking-apps/test-result';
import { bindable, customElement, ILogger } from 'aurelia';
import template from './by-browsers.html';
import { AvgMeasurement, VersionedItem } from './shared';
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
  private avgDataset: Measurement[];
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
