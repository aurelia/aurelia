import { resolve } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  StandardConfiguration,
} from '@aurelia/runtime-html';
import { IStore, StateDefaultConfiguration } from '@aurelia/state';


const App = CustomElement.define(
  {
    name: 'app',
    template: `\${message}`
  },
  class {
    constructor() {
      window.app = this;
      this.message = 'Hello world';
      this.store = resolve(IStore);
    }
  }
);

void new Aurelia().register(
  StandardConfiguration,
  StateDefaultConfiguration,
).app(
  {
    host: document.getElementById('app'),
    component: App,
  })
  .start();
