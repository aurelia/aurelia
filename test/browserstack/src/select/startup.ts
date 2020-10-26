import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { App } from './app';

window['au'] = new Aurelia()
  .register(StandardConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

