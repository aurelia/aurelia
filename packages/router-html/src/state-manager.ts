import { IStateManager } from '@aurelia/router';
import { ICustomElementController } from '@aurelia/runtime';

export class HTMLStateManager implements IStateManager<Element> {
  public saveState(controller: ICustomElementController<Element>): void {
    const elements = Array.from(controller.host.getElementsByTagName('*'));
    for (const el of elements) {
      if (el.scrollTop > 0 || el.scrollLeft) {
        el.setAttribute('au-element-scroll', `${el.scrollTop},${el.scrollLeft}`);
      }
    }
  }

  public restoreState(controller: ICustomElementController<Element>): void {
    const elements = Array.from(controller.host.getElementsByTagName('*'));
    for (const el of elements) {
      const attr = el.getAttribute('au-element-scroll');
      if (attr) {
        const [top, left] = attr.split(',');
        el.removeAttribute('au-element-scroll');
        el.scrollTo(+left, +top);
      }
    }
  }
}
