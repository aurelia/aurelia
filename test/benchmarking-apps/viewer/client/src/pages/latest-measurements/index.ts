import { BenchmarkMeasurements } from '@benchmarking-apps/test-result';
import { customElement, ILogger } from 'aurelia';
import { IApi } from '../data';
import { AvgMeasurements } from './avg-measurements';
import template from './index.html';
import { VersionedItem } from './shared';

@customElement({
  name: 'latest-measurements',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [
    AvgMeasurements
  ],
})
export class LatestMeasurements {
  private data: BenchmarkMeasurements;
  private frameworks: VersionedItem[];
  private browsers: VersionedItem[];
  public constructor(
    @IApi private readonly api: IApi,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('LatestMeasurements');
  }

  public async binding(): Promise<void> {
    this.logger.debug('binding()');
    return this.processData();
  }

  private async processData() {
    const data = this.data = await this.api.getLatest();
    const measurements = data.measurements;
    const frameworks: VersionedItem[] = this.frameworks = [];
    const browsers: VersionedItem[] = this.browsers = [];
    for (const m of measurements) {
      const fx = m.framework;
      const fxVer = m.frameworkVersion;
      const br = m.browser;
      const brVer = m.browserVersion;
      if (frameworks.find((f) => f.name === fx && f.version === fxVer) === void 0) {
        frameworks.push(new VersionedItem(fx, fxVer));
      }
      if (browsers.find((b) => b.name === br && b.version === brVer) === void 0) {
        browsers.push(new VersionedItem(fx, fxVer));
      }
    }
  }
}
