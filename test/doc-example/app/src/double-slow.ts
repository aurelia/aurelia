import { customElement } from '@aurelia/runtime-html';
import { slideIn, slideOut } from 'animations';

@customElement({
  name: 'double-slow',
  template: `
DoubleSlow
`})
export class DoubleSlow {
  public element: Element;

  private backwards = false;

  public created(controller): void {
    this.element = controller.host;
  }

  public loading(_params, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
    return new Promise(r => setTimeout(r, 2000));
  }
  public unloading(_instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }

  public binding() {
    return new Promise(r => setTimeout(r, 2000));
  }

  public attaching() {
    return slideIn(this.element, 2000, this.backwards ? 'left' : 'right');
  }
  public detaching() {
    return slideOut(this.element, 750, this.backwards ? 'right' : 'left');
  }
}
