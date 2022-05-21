import { customElement } from 'aurelia';
import { slideIn, slideOut } from './animations';
import template from './two.html';

@customElement({
  name: 'two',
  template,
})
export class Two {
  public backwards: boolean;
  public element: Element;

  // Once support is there, this would also move to animation-hooks.ts
  public created(controller): void {
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
    console.log('two detaching backwards', this.backwards);
    return slideOut(this.element, 750, this.backwards ? 'right' : 'left');
  }
}
