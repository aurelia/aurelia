import { App } from './app';
import { Aurelia } from './framework-new';

new Aurelia({
  host: document.body,
  root: new App()
});
