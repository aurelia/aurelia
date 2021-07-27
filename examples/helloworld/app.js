import { Aurelia, CustomElement, StandardConfiguration } from '@aurelia/runtime-html';

const App = CustomElement.define(
  {
    name: 'app',
    template: `\${message}`
  },
  class {
    constructor() {
      this.message = 'Hello world';
    }
  }
);

void new Aurelia().register(StandardConfiguration).app(
  {
    host: document.getElementById('app'),
    component: App,
  })
  .start();
