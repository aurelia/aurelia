import { ViewSlot } from '../templating/view-slot';
import { IScope } from '../binding/binding-interfaces';
import { IVisual, IViewFactory } from '../templating/view-engine';

/**
* For internal use only. May change without warning.
*/
export abstract class IfCore {
  private visual: IVisual = null;
  private scope: IScope = null;

  // If the child view is animated, `value` might not reflect the internal
  // state anymore, so we use `showing` for that.
  // Eventually, `showing` and `value` should be consistent.
  protected showing = false;

  constructor(private viewFactory: IViewFactory, protected viewSlot: ViewSlot) { }

  bound(scope: IScope) {
    this.scope = scope;
  }

  attached() {
    this.viewSlot.attach();
  }

  detached() {
    this.viewSlot.detach();
  }

  unbound() {
    if (this.visual === null) {
      return;
    }

    this.visual.unbind();

    if (this.showing) {
      this.showing = false;
      this.viewSlot.remove(this.visual, /*skipAnimation:*/true);
    }

    this.visual = null;
  }

  show() {
    if (this.showing) {
      // Ensures the view is bound.
      // It might not be the case when the if was unbound but not detached, then rebound.
      // Typical case where this happens is nested ifs
      if (!this.visual.$isBound) {
        this.visual.bind(this.scope);
      }

      return;
    }

    if (this.visual === null) {
      this.visual = this.viewFactory.create();
    }

    if (!this.visual.$isBound) {
      this.visual.bind(this.scope);
    }

    this.showing = true;
    return this.viewSlot.add(this.visual); // Promise or void
  }

  hide() {
    if (!this.showing) {
      return;
    }

    this.showing = false;
    let removed = this.viewSlot.remove(this.visual); // Promise or View

    if (removed instanceof Promise) {
      return removed.then(() => this.visual.unbind());
    }

    this.visual.unbind();
  }
}
