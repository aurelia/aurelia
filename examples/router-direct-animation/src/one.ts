import { customElement } from 'aurelia';
import template from './one.html';
import { AnimationHooks } from './animation-hooks';

@customElement({
  name: 'one',
  template,
  dependencies: [AnimationHooks],
})
export class One { }
