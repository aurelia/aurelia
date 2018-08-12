import { BindingFlags } from '../../binding/binding-flags';
import { ICustomAttribute } from '../custom-attribute';
import { IView, IViewFactory } from '../view';
import { IViewSlot } from '../view-slot';

/**
 * For internal use only. May change without warning.
 */
export interface IfCore extends ICustomAttribute {}
export abstract class IfCore {
  // If the child view is animated, `condition` might not reflect the internal
  // state anymore, so we use `showing` for that.
  // Eventually, `showing` and `condition` should be consistent.
  protected showing: boolean = false;

  private child: IView = null;

  constructor(private factory: IViewFactory, protected slot: IViewSlot) { }

  public unbound(): void {
    const view = this.child;

    if (view === null) {
      return;
    }

    this.child.$unbind(BindingFlags.none);

    if (!this.factory.isCaching) {
      return;
    }

    if (this.showing) {
      this.showing = false;
      this.slot.remove(view, /*returnToCache:*/true, /*skipAnimation:*/true);
    } else {
      view.tryReturnToCache();
    }

    this.child = null;
  }

  public show() {
    if (this.child === null) {
      this.child = this.factory.create();
    }

    this.child.$bind(BindingFlags.none, this.$scope);

    if (!this.showing) {
      this.showing = true;
      return this.slot.add(this.child);
    }
  }

  public hide() {
    if (!this.showing) {
      return;
    }

    const view = this.child;
    const removed = this.slot.remove(view);

    this.showing = false;

    if (removed instanceof Promise) {
      return removed.then(() => view.$unbind(BindingFlags.none));
    }

    view.$unbind(BindingFlags.none);
  }
}
