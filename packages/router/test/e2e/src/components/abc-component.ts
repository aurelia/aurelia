import { AppState } from './../app-state';
import { customElement } from '@aurelia/runtime';
import * as template from './abc-component.html';
import { inject } from '@aurelia/kernel';

@inject(AppState)
@customElement({ name: 'abc-component', template })
export class AbcComponent {
  name = 'abc-component';
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
    return !this.appState.blockEnterAbc;
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
