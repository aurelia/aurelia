import { Aurelia } from './runtime/aurelia';
import { App } from './app';
import * as Configuration from './generated-configuration';

Aurelia
  .register(Configuration)
  .app({ host: document.body, component: new App() })
  .start();
