import { customElement } from 'aurelia';
import { AnimationHooks } from './animation-hooks';

@customElement({
  name: 'fallback',
  template: 'Fallback for: ${missing}',
  dependencies: [AnimationHooks],
})
export class Fallback {
  public missing: string;
  public loading(parameters) {
    this.missing = parameters[0];
  }
}
