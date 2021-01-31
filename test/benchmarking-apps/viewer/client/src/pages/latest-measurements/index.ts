import { BenchmarkMeasurements } from '@benchmarking-apps/test-result';
import { customElement, ILogger } from 'aurelia';
import { ByBrowsers } from '../../components/by-browsers';
import { IApi } from '../../shared/data';
import template from './index.html';

@customElement({
  name: 'latest-measurements',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [
    ByBrowsers,
  ],
})
export class LatestMeasurements {
  private data: BenchmarkMeasurements;
  public constructor(
    @IApi private readonly api: IApi,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('LatestMeasurements');
  }

  public async binding(): Promise<void> {
    this.logger.debug('binding()');
    this.data = await this.api.getLatest();
  }
}
