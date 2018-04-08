import { Aurelia } from './runtime/aurelia';
import { App } from './app';
import { GeneratedConfiguration } from './generated-configuration';
import { DebugConfiguration } from './debug/configuration';

Aurelia
  .register(GeneratedConfiguration, DebugConfiguration)
  .app({ host: document.body, component: new App() })
  .start();
