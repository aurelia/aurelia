import { inject } from '../../../../../../kernel';
import { customElement } from '../../../../../../runtime';
import { AppState } from './../app-state';
import * as template from './abc-component.html';

@inject(AppState)
@customElement({ name: 'abc', template })
export class AbcComponent {
  public name = 'abc';
  public blockLeave = false;

  public counter = 0;

  public constructor(private readonly appState: AppState) { }

  public bound(...rest) {
    console.log(this.name, 'bound', this.appState, rest);
  }
  public attached(...rest) {
    console.log(this.name, 'attached', rest);
  }
  public canEnter(instruction, previousInstruction) {
    console.log(this.name, 'canEnter', ++this.counter, instruction, previousInstruction);
    return !this.appState.blockEnterAbc;
  }
  public enter(instruction, previousInstruction) {
    console.log(this.name, 'enter', ++this.counter, instruction, previousInstruction);
    return true;
  }
  public canLeave(previousInstruction, instruction) {
    console.log(this.name, 'canLeave', ++this.counter, previousInstruction, instruction);
    return !this.blockLeave;
  }
  public leave(previousInstruction, instruction) {
    console.log(this.name, 'leave', ++this.counter, previousInstruction, instruction);
    return true;
  }
}
