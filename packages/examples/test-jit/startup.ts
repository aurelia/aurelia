import { Aurelia } from '@aurelia/runtime';
import { App } from './app';
import { DebugConfiguration } from '../debug/configuration';
import { BasicConfiguration } from '../jit/configuration';

window['au'] = new Aurelia()
  .register(BasicConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
