import { AppState } from './../app-state';
import { customElement } from '@aurelia/runtime';
import * as template from './def-component.html';
import { inject } from '@aurelia/kernel';

@inject(AppState)
@customElement({ name: 'def-component', template })
export class DefComponent {
  name = 'def-component';
  blockLeave = false;

  counter = 0;

  constructor(private appState: AppState) { }

  bound(...rest) {
    console.log(this.name, 'bound', this.appState, rest);
  }
  attached(...rest) {
    console.log(this.name, 'attached', rest);
  }
  canEnter(...rest) {
    console.log(this.name, 'canEnter', ++this.counter, rest);
    return !this.appState.blockEnterDef;
  }
  enter(...rest) {
    console.log(this.name, 'enter', ++this.counter, rest);
    return true;
  }
  canLeave(...rest) {
    console.log(this.name, 'canLeave', ++this.counter, rest);
    return !this.blockLeave;
  }
  leave(...rest) {
    console.log(this.name, 'leave', ++this.counter, rest);
    return true;
  }
}
