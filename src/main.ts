import { App } from './app';
import { Aurelia } from './runtime/aurelia';

window['au'] = new Aurelia()
  .app({ host: document.body, component: new App() })
  .start();
