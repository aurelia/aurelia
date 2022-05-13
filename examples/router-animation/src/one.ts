import { customElement, lifecycleHooks } from 'aurelia';
import { slideIn, slideOut } from './animations';
import template from './one.html';
import { AnimationHooks } from './animation-hooks';

@customElement({
  name: 'one',
  template,
  dependencies: [AnimationHooks],
})
export class One {
  public backwards: boolean;
  public element: Element;

  // Once support is there, this would also move to animation-hooks.ts
  public created(controller): void {
    console.log('created', controller.lifecycleHooks);
    this.element = controller.host;
  }

  //public load(_params, _instruction, navigation) {
  //  this.backwards = navigation.navigation.back;
  //}
  // After the next router release, this method can also be moved to animation-hooks.ts
  public unload(_instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  // Once support is there, this would also move to animation-hooks.ts
  public attaching() {
    return slideIn(this.element, 750, this.backwards ? 'left' : 'right');
  }
  // Once support is there, this would also move to animation-hooks.ts
  public detaching() {
    return slideOut(this.element, 750, this.backwards ? 'right' : 'left');
  }
}
