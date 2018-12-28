import { HTMLJitConfiguration } from '@aurelia/jit-html';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(HTMLJitConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

