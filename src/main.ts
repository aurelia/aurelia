import { Aurelia } from './runtime/aurelia';
import { App } from './app';
import * as Configuration from './generated-configuration';
import * as DebugConfiguration from './debug/configuration';

Aurelia
  .register(Configuration, DebugConfiguration)
  .app({ host: document.body, component: new App() })
  .start();
