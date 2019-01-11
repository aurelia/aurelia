import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(BasicConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
