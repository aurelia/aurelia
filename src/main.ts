import { App } from './app';
import { Aurelia } from './runtime/aurelia';

(window as any)['aureliaApp'] = new Aurelia({
  host: document.body,
  component: new App()
}).start();
