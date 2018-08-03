import { BindingFlags } from '../../binding/binding-flags';
import { ICustomAttribute } from '../custom-attribute';
import { IRenderSlot } from '../render-slot';
import { IVisual, IVisualFactory } from '../visual';

/**
 * For internal use only. May change without warning.
 */

export interface IfCore extends ICustomAttribute {}
export abstract class IfCore {
  private child: IVisual = null;

  // If the child view is animated, `condition` might not reflect the internal
  // state anymore, so we use `showing` for that.
  // Eventually, `showing` and `condition` should be consistent.
  protected showing = false;

  constructor(private factory: IVisualFactory, protected slot: IRenderSlot) { }

  public unbound() {
    const visual = this.child;

    if (visual === null) {
      return;
    }

    this.child.$unbind(BindingFlags.none);

    if (!this.factory.isCaching) {
      return;
    }

    if (this.showing) {
      this.showing = false;
      this.slot.remove(visual, /*returnToCache:*/true, /*skipAnimation:*/true);
    } else {
      visual.tryReturnToCache();
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

    const visual = this.child;
    const removed = this.slot.remove(visual);

    this.showing = false;

    if (removed instanceof Promise) {
      return removed.then(() => visual.$unbind(BindingFlags.none));
    }

    visual.$unbind(BindingFlags.none);
  }
}
