import { bindable, customElement } from '@aurelia/runtime';
import template from './read-only-text.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - `interpolation-binding`
 *   - `property-binding`, different binding modes, such as `one-time`, and `to-view`.
 * - `@aurelia/runtime-html`
 *   - `setter-observer`
 *   - `element-property-accessor`
 * @export
 */
@customElement({ name: 'read-only-text', template })
export class ReadOnlyText {
  @bindable public value: string;
}
