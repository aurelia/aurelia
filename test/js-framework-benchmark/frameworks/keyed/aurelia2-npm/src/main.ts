import { RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

new Aurelia()
  .register(RuntimeHtmlBrowserConfiguration)
  .app({
    host: document.querySelector('app'),
    component: App
  })
  .start();
