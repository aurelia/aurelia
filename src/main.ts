import { NameTag } from './name-tag2';
import { Aurelia } from './framework/aurelia';

(window as any)['aureliaApp'] = new Aurelia({
  host: document.body,
  component: new NameTag()
}).start();
