import { customElement } from '@aurelia/runtime-html';
import template from './my-app.html';
// eslint-disable-next-line import/no-unassigned-import
import './my-app.css';

import { One } from './one';
import { Two } from './two';
import { AnimationHooks } from './animation-hooks';

@customElement({
  name: 'my-app',
  template,
  dependencies: [One, Two, AnimationHooks],
})
export class MyApp {
  public message: string = 'Hello Aurelia 2!';
}
