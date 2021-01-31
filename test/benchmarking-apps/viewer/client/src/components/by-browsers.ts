import { Measurement } from '@benchmarking-apps/test-result';
import { bindable, customElement, ILogger } from 'aurelia';
import { AvgMeasurement, DenormalizedMeasurement } from '../shared/data';
import { VersionedItem } from '../shared/utils';
import template from './by-browsers.html';
import { SmallMultiples } from './small-multiples';
import { StackedBars } from './stacked-bars';

type IMeasurement = Measurement | AvgMeasurement | DenormalizedMeasurement;
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
  @bindable public readonly dataset: Measurement[] | DenormalizedMeasurement[];
  @bindable public readonly showAverage: boolean = true;
  private avgDataset: AvgMeasurement[];
  private readonly measurementIdentifier: (m: IMeasurement) => string = function (m) { return (m as AvgMeasurement | DenormalizedMeasurement).id ?? `${m.framework}@${m.frameworkVersion}`; };
  private readonly totalDurationFn: (m: IMeasurement) => number = function (m) { return m.totalDuration; };
  private browsers: VersionedItem[];
  private activeBrowser: VersionedItem | undefined;

  public constructor(
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('ByBrowsers');
  }

  public binding(): void {
    const browsers: VersionedItem[] = this.browsers = [];
    for (const m of this.dataset) {
      const br = m.browser;
      const brVer = m.browserVersion;
      if (browsers.find((b) => b.name === br && b.version === brVer) === void 0) {
        browsers.push(new VersionedItem(br, brVer));
      }
    }
    const numBrowsers = browsers.length;
    if (numBrowsers === 1 || !this.showAverage) {
      this.activeBrowser = browsers[0];
    } else if (numBrowsers > 1) {
      this.computeAverageDataset();
    }
  }

  private computeAverageDataset() {
    const avgDataset: AvgMeasurement[] = this.avgDataset = [];
    for (const item of this.dataset) {
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
    return (this.dataset as { browser: string; browserVersion: string }[]).filter((m) => m.browser === browser.name && m.browserVersion === browser.version);
  }
}
