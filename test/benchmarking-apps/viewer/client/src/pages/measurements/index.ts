import { customElement, ILogger, shadowCSS, ValueConverter } from 'aurelia';
import template from './index.html';
import css from './index.css';

import { DataSet, IApi } from './data';

@customElement({
  name: 'measurements-page',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [
    shadowCSS(css),
    ValueConverter.define('formatDurationKey', class {
      public toView(input: string): string {
        return input.replace('duration', '');
      }
    }),
    ValueConverter.define('round', class {
      public toView(input: number, decimals: number = 1): number {
        if (Number.isFinite(input)) {
          return Math.round(input * 10 ** decimals) / 10 ** decimals;
        }
        return NaN;
      }
    }),
    ValueConverter.define('shortDate', class {
      public toView(input: number): string {
        if (Number.isFinite(input)) {
          const date = new Date(input);
          return `${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
        }
        return 'N/A';
      }
    }),
    ValueConverter.define('shortTime', class {
      public toView(input: number): string {
        if (Number.isFinite(input)) {
          const date = new Date(input);
          return `${date.getUTCHours()}:${date.getUTCMinutes()}`;
        }
        return 'N/A';
      }
    }),
  ],
})
export class MeasurementsPage {
  public data: DataSet | null = null;

  public constructor(
    @IApi private readonly api: IApi,
    @ILogger private readonly logger: ILogger,
  ) {
    (this.logger = logger.scopeTo('MeasurementsPage')).debug('constructor()');
  }

  public async binding(): Promise<void> {
    this.logger.debug('binding()');

    this.data = await this.api.getData();
  }
}
