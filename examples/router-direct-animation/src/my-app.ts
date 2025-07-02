import { customElement } from '@aurelia/runtime-html';
import template from './my-app.html';
// eslint-disable-next-line import/no-unassigned-import
import './my-app.css';

import { One } from './one';
import { Two } from './two';
import { Three } from './three';
import { AnimationHooks } from './animation-hooks';

@customElement({
  name: 'my-app',
  template,
  dependencies: [One, Two, Three, AnimationHooks],
})
export class MyApp {

  public static routes = [
    { path: '', component: 'one' },
    { path: 'ett/tva/tre', component: 'one' },
    { path: 'tre', component: 'three' },
    { path: "/page/1", component: import('./pages/page-1'), title: 'Page 1', },

  ];

  public message: string = 'Hello Aurelia 2!';
}
