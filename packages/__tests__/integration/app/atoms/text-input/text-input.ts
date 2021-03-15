import { bindable, customElement } from '@aurelia/runtime-html';
import template from './text-input.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - bindings
 *     - `property-binding`, different binding modes, such as `two-way`, `one-time`, `to-view`, and `from-view`.
 *   - custom-attributes
 *     - `if` (template controller)
 * - `@aurelia/runtime-html`
 *   - bindings
 *     - `value-attribute-observer`
 *   - binding behavior
 *     - `update-trigger`
 */
@customElement({ name: 'text-input', template })
export class TextInput {
  @bindable public value: string;
  @bindable public trigger: string = undefined;
}
