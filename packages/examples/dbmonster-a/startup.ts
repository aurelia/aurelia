import { Aurelia } from '@aurelia/runtime';
import { App } from './app';
import { GeneratedConfiguration } from './generated-configuration';
import { DebugConfiguration } from '../debug/configuration';

window['au'] = new Aurelia()
  .register(GeneratedConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
