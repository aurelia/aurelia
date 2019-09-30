import { PixiConfiguration } from '@aurelia/plugin-pixi';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(JitHtmlBrowserConfiguration, PixiConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

