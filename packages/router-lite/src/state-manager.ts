import { ICustomElementController } from '@aurelia/runtime-html';
import { DI } from '@aurelia/kernel';

class ScrollState {
  /** @internal */ private readonly _top: number;
  /** @internal */ private readonly _left: number;

  public constructor(/** @internal */ private _el: Element) {
    this._top = _el.scrollTop;
    this._left = _el.scrollLeft;
  }

  /** @internal */
  public static _has(el: Element): boolean {
    return el.scrollTop > 0 || el.scrollLeft > 0;
  }

  /** @internal */
  public _restore(): void {
    this._el.scrollTo(this._left, this._top);
    this._el = null!;
  }
}

function restoreState(state: ScrollState): void {
  state._restore();
}

class HostElementState {
  /** @internal */ private _scrollStates: ScrollState[] = [];

  public constructor(host: Element) {
    this._save(host.children);
  }

  /** @internal */
  private _save(elements: HTMLCollection): void {
    let el: Element;
    for (let i = 0, ii = elements.length; i < ii; ++i) {
      el = elements[i];
      if (ScrollState._has(el)) {
        this._scrollStates.push(new ScrollState(el));
      }

      this._save(el.children);
    }
  }

  /** @internal */
  public _restore(): void {
    this._scrollStates.forEach(restoreState);
    this._scrollStates = null!;
  }
}

export const IStateManager = /*@__PURE__*/DI.createInterface<IStateManager>('IStateManager', x => x.singleton(ScrollStateManager));
export interface IStateManager {
  saveState(controller: ICustomElementController): void;
  restoreState(controller: ICustomElementController): void;
}

export class ScrollStateManager implements IStateManager {
  private readonly _cache: WeakMap<HTMLElement, HostElementState> = new WeakMap();

  public saveState(controller: ICustomElementController): void {
    this._cache.set(controller.host, new HostElementState(controller.host));
  }

  public restoreState(controller: ICustomElementController): void {
    const state = this._cache.get(controller.host);
    if (state !== void 0) {
      state._restore();
      this._cache.delete(controller.host);
    }
  }
}
