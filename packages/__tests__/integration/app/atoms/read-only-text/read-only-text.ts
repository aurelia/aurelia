import { bindable, customElement } from '@aurelia/runtime-html';
import template from './read-only-text.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - `interpolation-binding`
 *   - `property-binding`, different binding modes, such as `one-time`, and `to-view`.
 * - `@aurelia/runtime-html`
 *   - `setter-observer`
 *   - `element-property-accessor`
 */
@customElement({ name: 'read-only-text', template })
export class ReadOnlyText {
  @bindable public value: string;
}
