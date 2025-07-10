import { customElement } from 'aurelia';
import template from './two.html';
import { AnimationHooks } from './animation-hooks';

@customElement({
  name: 'two',
  template,
  dependencies: [AnimationHooks],
})
export class Two {
  canLoad() {
    return '/ett/tva/tre';
  }
}
