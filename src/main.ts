import { App } from './app';
import { Aurelia } from './framework/aurelia';

window['aureliaApp'] = new Aurelia({
  host: document.body,
  component: new App()
}).start();
