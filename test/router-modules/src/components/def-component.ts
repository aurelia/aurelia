import { customElement } from '@aurelia/runtime';
import { AppState } from '../app-state';
import * as template from './def-component.html';
import { ILogger } from 'aurelia';

@customElement({ name: 'def-component', template })
export class DefComponent {
  public name = 'def-component';
  public blockLeave = false;

  public counter = 0;

  public constructor(
    private readonly appState: AppState,
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo(this.constructor.name);
  }

  public afterBind(...rest) {
    this.logger.debug(this.name, 'afterBind', this.appState, rest);
  }
  public afterAttach(...rest) {
    this.logger.debug(this.name, 'afterAttach', rest);
  }
  public canEnter(instruction, previousInstruction) {
    this.logger.debug(this.name, 'canEnter', ++this.counter, instruction, previousInstruction);
    return !this.appState.blockEnterAbc;
  }
  public enter(instruction, previousInstruction) {
    this.logger.debug(this.name, 'enter', ++this.counter, instruction, previousInstruction);
    return true;
  }
  public canLeave(previousInstruction, instruction) {
    this.logger.debug(this.name, 'canLeave', ++this.counter, previousInstruction, instruction);
    return !this.blockLeave;
  }
  public leave(previousInstruction, instruction) {
    this.logger.debug(this.name, 'leave', ++this.counter, previousInstruction, instruction);
    return true;
  }
}
