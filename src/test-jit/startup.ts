import { Aurelia } from '../runtime/aurelia';
import { App } from './app';
import { DebugConfiguration } from '../debug/configuration';
import { BasicConfiguration } from '../jit/configuration';
import { enableArrayObservation } from '../runtime/binding/array-observation';

enableArrayObservation();
window['au'] = new Aurelia()
  .register(BasicConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
