import { customElement } from '@aurelia/runtime';
import * as template from './def-component.html';

@customElement({ name: 'def-component', template })
export class DefComponent {
  name = 'def-component';

  counter = 0;

  bound(...rest) {
    console.log(this.name, 'bound', rest);
  }
  attached(...rest) {
    console.log(this.name, 'attached', rest);
  }
  canEnter(...rest) {
    console.log(this.name, 'canEnter', ++this.counter, rest);
    return true;
  }
  enter(...rest) {
    console.log(this.name, 'enter', ++this.counter, rest);
    return true;
  }
  canLeave(...rest) {
    console.log(this.name, 'canLeave', ++this.counter, rest);
    return true;
  }
  leave(...rest) {
    console.log(this.name, 'leave', ++this.counter, rest);
    return true;
  }
}
