import { IfCore } from "./if-core";
import { Else } from "./else";
import { IViewFactory } from "../templating/view-engine";
import { IViewSlot } from "../templating/view-slot";
import { inject, templateController, customAttribute, bindable } from "../decorators";

@customAttribute('if')
@templateController
@inject(IViewFactory, IViewSlot)
export class If extends IfCore {
  private animating = false;
  private elseBehavior: Else;

  @bindable swapOrder: 'before' | 'with' | 'after' = 'after';
  @bindable condition: boolean = false;

  conditionChanged(newValue) {
    this.update(newValue);
  }

  link(elseBehavior: Else) {
    if (this.elseBehavior === elseBehavior) {
      return this;
    }

    this.elseBehavior = elseBehavior;
    elseBehavior.link(this);

    return this;
  }

  private update(show) {
    if (this.animating) {
      return;
    }

    let promise;

    if (this.elseBehavior) {
      promise = show ? this.swap(this.elseBehavior, this) : this.swap(this, this.elseBehavior);
    } else {
      promise = show ? this.show() : this.hide();
    }

    if (promise) {
      this.animating = true;

      promise.then(() => {
        this.animating = false;

        if (this.condition !== this.showing) {
          this.update(this.condition);
        }
      });
    }
  }

  private swap(remove: IfCore, add: IfCore) {
    switch (this.swapOrder) {
      case 'before':
        return Promise.resolve(<any>add.show()).then(() => remove.hide());
      case 'with':
        return Promise.all([<any>remove.hide(), add.show()]);
      default:  // "after", default and unknown values
        let promise = remove.hide();
        return promise ? promise.then(() => <any>add.show()) : add.show();
    }
  }
}
