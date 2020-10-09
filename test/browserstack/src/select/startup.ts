import { RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(RuntimeHtmlBrowserConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

