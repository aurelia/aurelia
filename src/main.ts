import { App } from './app2';
import { Aurelia } from './framework/aurelia';

(window as any)['aureliaApp'] = new Aurelia({
  host: document.body,
  component: new App()
}).start();
