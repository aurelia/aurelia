import { bindable, customElement } from '@aurelia/runtime-html';
import template from './command.html';

/**
 * Potential test coverage targets:
 * - `@aurelia/runtime`
 *   - `call-binding`
 */
@customElement({ name: 'command', template })
export class Command {
  @bindable public action: () => void;
  @bindable public name: string;
}
