import { BenchmarkMeasurements } from '@benchmarking-apps/test-result';
import { customElement, ILogger, Parameters, shadowCSS, valueConverter } from 'aurelia';
import { ByBrowsers } from '../../components/by-browsers';
import { BenchmarkContext, IApi } from '../../shared/data';
import template from './index.html';
import css from './index.css';
import { ErrorInfo } from '../../components/error-info';

// Because ts-loader surprisingly yells about `'dateStyle' does not exist in type 'DateTimeFormatOptions'.`, even though vscode is at peace with it.
// Adding the "ESNext.Intl", "ES2018.Intl" libs to tsconfig didn't help.
interface DateTimeFormatOptions extends Intl.DateTimeFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
}

@valueConverter('time')
class TimeValueConverter {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  private static readonly formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'medium' } as DateTimeFormatOptions);
  public toView(data: BenchmarkMeasurements): string {
    const tsStart = new Date(data.ts_start);
    const tsEnd = new Date(data.ts_end);
    return `${TimeValueConverter.formatter.format(tsEnd)} (duration: ${tsEnd.getTime() - tsStart.getTime()} ms)`;
  }
}

@customElement({
  name: 'latest-measurements',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [
    shadowCSS(css),
    TimeValueConverter,
    ByBrowsers,
    ErrorInfo,
  ],
})
export class LatestMeasurements {
  private readonly context: BenchmarkContext = new BenchmarkContext(this.api, false);
  private data: BenchmarkMeasurements;
  public constructor(
    @IApi private readonly api: IApi,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('LatestMeasurements');
  }

  public async load(params: Parameters): Promise<void> {
    const context = this.context;
    context.branch = params.branch as string ?? undefined;
    context.commit = params.commit as string ?? undefined;
    this.data = await context.fetchData();
  }
}
