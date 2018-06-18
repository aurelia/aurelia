import { Aurelia } from './runtime/aurelia';
import { App } from './test-aot/app';
import { GeneratedConfiguration } from './test-aot/generated-configuration';
import { DebugConfiguration } from './debug/configuration';

new Aurelia()
  .register(GeneratedConfiguration, DebugConfiguration)
  .app({ host: document.querySelector('app'), component: new App() })
  .start();
