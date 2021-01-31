import { observable } from '@aurelia/runtime-html';
import { BenchmarkMeasurements } from '@benchmarking-apps/test-result';
import { customElement, ILogger, Params, RouteNode, shadowCSS } from 'aurelia';
import { ByBrowsers } from '../../components/by-browsers';
import { DenormalizedMeasurement, IApi } from '../../shared/data';
import css from './index.css';
import template from './index.html';

@customElement({
  name: 'compare-branches',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(css), ByBrowsers]
})
export class CompareBranches {
  private readonly candidate1: Candidate = new Candidate(this.api);
  private readonly candidate2: Candidate = new Candidate(this.api);
  private dataset: DenormalizedMeasurement[];

  public constructor(
    @IApi private readonly api: IApi,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('CompareBranches');
  }

  public async load(_: Params, node: RouteNode): Promise<void> {
    const query = node.queryParams;
    const candidate1 = this.candidate1;
    const candidate2 = this.candidate2;
    const [b1, b2] = ([candidate1.branch, candidate2.branch] = query.getAll('branch'));
    [candidate1.commit, candidate2.commit] = query.getAll('commit');
    // coercion intended
    if (b1 && b2) {
      return this.fetchData();
    }
  }

  private async compare() {
    // TODO validate input
    await this.fetchData();
  }

  private async fetchData() {
    const candidate1 = this.candidate1;
    const candidate2 = this.candidate2;
    const [data1, data2] = await Promise.all([candidate1.fetchData(), candidate2.fetchData()]);
    this.dataset = [
      ...data1.measurements.map(m => new DenormalizedMeasurement(m, data1)),
      ...data2.measurements.map(m => new DenormalizedMeasurement(m, data2))
    ];
    this.logger.debug('fetchData()', this.dataset);
  }
}

enum CandidateError {
  commitNotFound,
  branchNotFound,
}

class Candidate {
  @observable({ callback: 'reset' }) public branch: string | undefined;
  @observable({ callback: 'reset' }) public commit: string | undefined;
  public error: CandidateError | null = null;
  public data: BenchmarkMeasurements | null = null;

  public constructor(
    @IApi private readonly api: IApi,
  ) { }

  public async fetchData() {
    await this.$fetchData(this.branch, this.commit);
    return this.data;
  }

  private async $fetchData(branch: string, commit?: string) {
    if (!branch) {
      throw new Error('Cannot fetch data before setting the branch');
    }
    try {
      this.data = await this.api.getLatest(branch, commit, true);
      this.error = null;
    } catch {
      if (commit !== void 0) {
        this.error = CandidateError.commitNotFound;
        await this.$fetchData(branch);
      } else if (branch !== void 0) {
        this.error = CandidateError.branchNotFound;
      }
    }
  }

  private reset() {
    this.data = null;
  }
}


