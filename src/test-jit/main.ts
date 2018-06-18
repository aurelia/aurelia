import { Aurelia } from '../runtime/aurelia';
import { App } from './app';
import { DebugConfiguration } from '../debug/configuration';
import { BasicConfiguration } from '../jit/configuration';

new Aurelia()
  .register(BasicConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
