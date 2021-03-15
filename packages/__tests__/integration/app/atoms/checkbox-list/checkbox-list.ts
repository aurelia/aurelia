import { customElement, bindable } from '@aurelia/runtime-html';
import template from './checkbox-list.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - `array-observer`
 * - `@aurelia/runtime-html`
 *   - `checked-observer` (`checked` bind)
 *   - `setter-observer` (`model` bind)
 */
@customElement({ name: 'checkbox-list', template })
export class CheckboxList {
  @bindable public choices1: object[];
  @bindable public selectedItems1: object[];

  @bindable public choices2: object[];
  @bindable public selectedItems2: object[];
  @bindable public matcher: (a: object, b: object) => boolean;
}
