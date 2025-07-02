import { customElement } from "aurelia";
import { AnimationHooks } from '../animation-hooks';

@customElement({
  name: 'page-1',
  template: `I'm a page. I'm the first one`,
  dependencies: [AnimationHooks],
})
export class Page1 { }
