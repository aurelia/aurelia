import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';
import { customElement, ILogger, Params, RouteNode, shadowCSS } from 'aurelia';
import { ByBrowsers } from '../../components/by-browsers';
import { ErrorInfo } from '../../components/error-info';
import { BenchmarkContext, DenormalizedMeasurement, IApi } from '../../shared/data';
import css from './index.css';
import template from './index.html';

@customElement({
  name: 'compare-branches',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(css), ByBrowsers, ErrorInfo]
})
export class CompareBranches {
  private readonly candidate1: BenchmarkContext = new BenchmarkContext(this.api, true);
  private readonly candidate2: BenchmarkContext = new BenchmarkContext(this.api, true);
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

    if (data1 === null || data2 === null) {
      this.logger.warn(`Cannot compare branches. Data for one of the candidate is not available.`);
      return;
    }

    this.dataset = [
      ...data1.measurements.map(m => new DenormalizedMeasurement(m, data1)),
      ...data2.measurements.map(m => new DenormalizedMeasurement(m, data2))
    ];
    this.logger.debug('fetchData()', this.dataset);
  }

  private applyValidationRules() {
    const rules = this.validationRules;
    rules
      .on(BenchmarkContext)
      .ensure('branch')
      .required()
      .withMessage('Enter a branch name.')
      .ensure('commit')
      .matches(/^[0-9a-f]{7,}$/i)
      .withMessage('Enter a valid commit hash, at least 7 characters long.');
  }
}
