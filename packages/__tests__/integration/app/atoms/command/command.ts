import { bindable, customElement } from '@aurelia/runtime';
import * as template from './command.html';

@customElement({ name: 'command', template })
export class Command {
  @bindable public action: () => void;
  @bindable public name: string;
}
