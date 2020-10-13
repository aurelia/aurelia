import { RuntimeHtmlConfiguration } from '@aurelia/runtime-html';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(RuntimeHtmlConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

