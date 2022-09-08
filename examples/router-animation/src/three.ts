import { customElement } from 'aurelia';
import template from './three.html';
import { AnimationHooks } from './animation-hooks';

@customElement({
  name: 'three',
  template,
  dependencies: [AnimationHooks],
})
export class Three {
  public static routes = [
    { path: 'ett/tva/tre', component: 'one' },
  ];
}
