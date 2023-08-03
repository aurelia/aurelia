import { customElement, bindable } from '@aurelia/runtime-html';
import template from './tri-state-boolean.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime-html`
 *   - `checked-observer` for boolean
 */

@customElement({ name: 'tri-state-boolean', template })
export class TriStateBoolean {
  @bindable public noValueDisplay: string;
  @bindable public trueDisplay: string;
  @bindable public falseDisplay: string;
  @bindable public value?: boolean;
}
