import { customElement } from '@aurelia/runtime';
import * as template from './abc-component.html';

@customElement({ name: 'abc-component', template })
export class AbcComponent {
  name = 'abc-component';

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
