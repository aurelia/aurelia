import { BasicConfiguration } from '@aurelia/jit';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(BasicConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

