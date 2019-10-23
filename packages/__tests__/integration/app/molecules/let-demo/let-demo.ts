import { customElement, valueConverter } from '@aurelia/runtime';
import * as template from './let-demo.html';

@customElement({ name: 'let-demo', template })
export class LetDemo {
  public a: boolean = false;
  public b: boolean = false;

  public ec = { x: 10, a: -5, b: 3 };
  public line = { y: 10, intercept: 2, slope: 2 };
}

@valueConverter({name: 'sqrt'})
export class SqrtValueConverter {
  public toView(value: number) {
    return Math.sqrt(value);
  }
}
