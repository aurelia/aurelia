import { customElement, valueConverter } from '@aurelia/runtime-html';
import template from './let-demo.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - Bindings
 *     - `let-binding`
 *     - `ast` (partial)
 *        - `BinaryExpression`
 *        - `UnaryExpression`
 *        - `ValueConverterExpression`
 */
@customElement({ name: 'let-demo', template })
export class LetDemo {
  public a: boolean = false;
  public b: boolean = false;

  public ec: { [key: string]: number } = { x: 10, a: -5, b: 3 };
  public line: { [key: string]: number } = { y: 10, intercept: 2, slope: 2 };
}

@valueConverter({ name: 'sqrt' })
export class SqrtValueConverter {
  public toView(value: number) {
    return Math.sqrt(value);
  }
}
