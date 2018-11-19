import { AppState } from './../app-state';
import { customElement } from '@aurelia/runtime';
import * as template from './content-component.html';
import { inject } from '@aurelia/kernel';

@inject(AppState)
@customElement({ name: 'content-component', template })
export class ContentComponent {
  name = 'content-component';

  counter = 0;

  constructor(private appState: AppState) { }

  bound(...rest) {
    console.log(this.name, 'bound', this.appState, rest);
  }
  attached(...rest) {
    console.log(this.name, 'attached', rest);
  }
  canEnter(instruction, previousInstruction) {
    console.log(this.name, 'canEnter', ++this.counter, instruction, previousInstruction);
    return true;
  }
  enter(instruction, previousInstruction) {
    console.log(this.name, 'enter', ++this.counter, instruction, previousInstruction);
    return true;
  }
  canLeave(previousInstruction, instruction) {
    console.log(this.name, 'canLeave', ++this.counter, previousInstruction, instruction);
    return true;
  }
  leave(previousInstruction, instruction) {
    console.log(this.name, 'leave', ++this.counter, previousInstruction, instruction);
    return true;
  }
}
