import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

new Aurelia()
  .register(JitHtmlBrowserConfiguration)
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();
