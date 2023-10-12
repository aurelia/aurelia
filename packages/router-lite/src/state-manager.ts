import { ICustomElementController } from '@aurelia/runtime-html';
import { DI } from '@aurelia/kernel';

class ScrollState {
  private readonly top: number;
  private readonly left: number;

  public constructor(private el: Element) {
    this.top = el.scrollTop;
    this.left = el.scrollLeft;
  }

  public static has(el: Element): boolean {
    return el.scrollTop > 0 || el.scrollLeft > 0;
  }

  public restore(): void {
    this.el.scrollTo(this.left, this.top);
    this.el = null!;
  }
}

function restoreState(state: ScrollState): void {
  state.restore();
}

class HostElementState {
  private scrollStates: ScrollState[] = [];

  public constructor(host: Element) {
    this.save(host.children);
  }

  private save(elements: HTMLCollection): void {
    let el: Element;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      el = elements[i];
      if (ScrollState.has(el)) {
        this.scrollStates.push(new ScrollState(el));
      }

      this.save(el.children);
    }
  }

  public restore(): void {
    this.scrollStates.forEach(restoreState);
    this.scrollStates = null!;
  }
}

export const IStateManager = /*@__PURE__*/DI.createInterface<IStateManager>('IStateManager', x => x.singleton(ScrollStateManager));
export interface IStateManager {
  saveState(controller: ICustomElementController): void;
  restoreState(controller: ICustomElementController): void;
}

export class ScrollStateManager implements IStateManager {
  private readonly cache: WeakMap<HTMLElement, HostElementState> = new WeakMap();

  public saveState(controller: ICustomElementController): void {
    this.cache.set(controller.host, new HostElementState(controller.host));
  }

  public restoreState(controller: ICustomElementController): void {
    const state = this.cache.get(controller.host);
    if (state !== void 0) {
      state.restore();
      this.cache.delete(controller.host);
    }
  }
}
