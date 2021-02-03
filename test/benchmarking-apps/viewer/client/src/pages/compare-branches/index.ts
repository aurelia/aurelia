import { newInstanceForScope } from '@aurelia/kernel';
import { observable } from '@aurelia/runtime-html';
import { IValidationRules } from '@aurelia/validation';
import { BenchmarkMeasurements } from '@benchmarking-apps/test-result';
import { customElement, ILogger, Params, RouteNode, shadowCSS } from 'aurelia';
import { IValidationController } from '@aurelia/validation-html';
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
  private areSameCandidates: boolean = false;

  public constructor(
    @IApi private readonly api: IApi,
    @ILogger private readonly logger: ILogger,
    @newInstanceForScope(IValidationController) private readonly controller: IValidationController,
    @IValidationRules private readonly validationRules: IValidationRules,
  ) {
    this.logger = logger.scopeTo('CompareBranches');
    this.applyValidationRules();
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
    this.areSameCandidates = false;
    const controller = this.controller;
    if (
      !(await controller.validate()).valid
      || (this.areSameCandidates = this.candidate1.isEqual(this.candidate2))
    ) {
      return;
    }
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

  private applyValidationRules() {
    const rules = this.validationRules;
    rules
      .on(Candidate)
      .ensure('branch')
      .required()
      .withMessage('Enter a branch name.')
      .ensure('commit')
      .matches(/^[0-9a-f]{7,}$/i)
      .withMessage('Enter a valid commit hash, at least 7 characters long.');
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

  public isEqual(that: Candidate): boolean {
    if (this.branch === that.branch) {
      const c1 = this.commit;
      const c2 = that.commit;
      if (c1 === c2) {
        return true;
      } else if ((c1?.substring(0, 8) ?? '') === (c2?.substring(0, 8) ?? '')) {
        return true;
      }
    }
    // At this point either we have different branches or 2 commits those are sufficiently different for same branch.
    return false;
  }

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
