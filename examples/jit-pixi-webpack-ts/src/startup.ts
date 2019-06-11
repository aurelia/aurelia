import { PixiJitConfiguration } from '@aurelia/jit-pixi';
import { Aurelia } from '@aurelia/runtime';
import { App } from './app';

window['au'] = new Aurelia()
  .register(PixiJitConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();

