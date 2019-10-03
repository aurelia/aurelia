import { bindable, customElement } from '@aurelia/runtime';
import template from './text-input.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - `property-binding`, different binding modes, such as `two-way`, `one-time`, `to-view`, and `from-view`.
 * - `@aurelia/runtime-html`
 *   - `value-attribute-observer`
 * @export
 */
@customElement({ name: 'text-input', template })
export class TextInput {
  @bindable public value: string;
}
