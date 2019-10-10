import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

global['Aurelia'] = new Aurelia()
  .register(JitHtmlBrowserConfiguration)
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();
