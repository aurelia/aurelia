import { bindable, customElement, shadowCSS } from 'aurelia';
import { BenchmarkContext, BenchmarkContextErrors } from '../shared/data';
import template from './error-info.html';
import css from './error-info.css';

@customElement({
  name: 'error-info',
  template,
  shadowOptions: { mode: 'open' },
  dependencies: [shadowCSS(css)],
})
export class ErrorInfo {
  @bindable public context: BenchmarkContext;
  @bindable public showError: boolean;
  private readonly Errors: typeof BenchmarkContextErrors = BenchmarkContextErrors;
}
