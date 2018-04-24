import { IViewSlot } from '../templating/view-slot';
import { IVisual, IViewFactory } from '../templating/view-engine';
import { IScope } from '../binding/binding-context';

/**
* For internal use only. May change without warning.
*/
export abstract class IfCore {
  private child: IVisual = null;
  private $scope: IScope = null;

  // If the child view is animated, `condition` might not reflect the internal
  // state anymore, so we use `showing` for that.
  // Eventually, `showing` and `condition` should be consistent.
  protected showing = false;

  constructor(private factory: IViewFactory, protected viewSlot: IViewSlot) { }

  unbound() {
    const visual = this.child;

    if (visual === null) {
      return;
    }

    this.child.unbind();

    if (!this.factory.isCaching) {
      return;
    }

    if (this.showing) {
      this.showing = false;
      this.viewSlot.remove(visual, /*returnToCache:*/true, /*skipAnimation:*/true);
    } else {
      visual.tryReturnToCache();
    }

    this.child = null;
  }

  show() {
    if (this.child === null) {
      this.child = this.factory.create();
    }

    this.child.bind(this.$scope);

    if (!this.showing) {
      this.showing = true;
      return this.viewSlot.add(this.child);
    }
  }

  hide() {
    if (!this.showing) {
      return;
    }

    const visual = this.child;
    const removed = this.viewSlot.remove(visual);

    this.showing = false;
    
    if (removed instanceof Promise) {
      return removed.then(() => visual.unbind());
    }

    visual.unbind();
  }
}
