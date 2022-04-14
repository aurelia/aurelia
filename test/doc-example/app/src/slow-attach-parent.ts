import { customElement, INode } from '@aurelia/runtime-html';
import { slideIn, slideOut } from 'animations';

@customElement({
  name: 'slow-attach-parent',
  template: `
SlowAttachParent \${seconds}
<div>
  <div class="links">
    <a load="fast">Fast</a>
    <a load="slow">Slow</a>
    <a load="fast-parent">FastParent</a>
    <a load="-" class="clear">X</a>
  </div>
  <au-viewport name="slow-attach-parent"></au-viewport>
</div>
`})
export class SlowAttachParent {
  public element: Element;

  public seconds = 0;

  private backwards = false;
  public created(controller): void {
    this.element = controller.host;
    const _this = this;
    setInterval(() => { _this.seconds++; }, 1000);
  }

  public load(_params, _instruction, navigation) {
    this.backwards = navigation.navigation.back;
  }
  public unload(_params, _instruction, navigation) {
    this.backwards = navigation.navigation?.back;
  }

  public attaching() {
    return slideIn(this.element, 2000, this.backwards ? 'left' : 'right');
  }
  public detaching() {
    return slideOut(this.element, 750, this.backwards ? 'right' : 'left');
  }
}
