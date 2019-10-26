/* eslint-disable jsdoc/check-indentation */
import { bindable, customElement } from '@aurelia/runtime';
import * as template from './command.html';

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
