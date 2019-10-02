import { Aurelia } from '@aurelia/runtime';
import { App } from './app';
import { DebugConfiguration } from '../debug/configuration';
import { JitConfiguration } from '../jit/configuration';

window['au'] = new Aurelia()
  .register(JitConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
