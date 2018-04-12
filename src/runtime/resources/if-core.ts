import { ViewSlot } from '../templating/view-slot';
import { IVisual, IViewFactory } from '../templating/view-engine';
import { IScope } from '../binding/binding-context';

/**
* For internal use only. May change without warning.
*/
export abstract class IfCore {
  private visual: IVisual = null;
  private $scope: IScope = null;

  // If the child view is animated, `value` might not reflect the internal
  // state anymore, so we use `showing` for that.
  // Eventually, `showing` and `value` should be consistent.
  protected showing = false;

  constructor(private viewFactory: IViewFactory, protected viewSlot: ViewSlot) { }

  unbound() {
    if (this.visual === null) {
      return;
    }

    if (this.showing) {
      this.showing = false;
      this.viewSlot.remove(this.visual, /*skipAnimation:*/true);
      this.visual.unbind();
    } else {
      this.visual.unbind();
    }

    this.visual = null;
  }

  show() {
    if (this.visual === null) {
      this.visual = this.viewFactory.create();
    }

    if (!this.visual.$isBound) {
      this.visual.bind(this.$scope);
    }

    if (!this.showing) {
      this.showing = true;
      return this.viewSlot.add(this.visual);
    }
  }

  hide() {
    if (!this.showing) {
      return;
    }

    this.showing = false;
    let removed = this.viewSlot.remove(this.visual);

    if (removed instanceof Promise) {
      return removed.then(() => this.visual.unbind());
    }

    this.visual.unbind();
  }
}
