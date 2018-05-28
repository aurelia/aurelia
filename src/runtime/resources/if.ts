import { IfCore } from './if-core';
import { Else } from './else';
import { IRenderSlot, SwapOrder } from '../templating/render-slot';
import { templateController, customAttribute, bindable } from '../decorators';
import { inject } from '../di';
import { IVisualFactory } from '../templating/visual';

@customAttribute('if')
@templateController
@inject(IVisualFactory, IRenderSlot)
export class If extends IfCore {
  private animating = false;
  private elseBehavior: Else;

  @bindable swapOrder: SwapOrder = SwapOrder.after;
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
      case SwapOrder.before:
        return Promise.resolve(<any>add.show()).then(() => remove.hide());
      case SwapOrder.with:
        return Promise.all([<any>remove.hide(), add.show()]);
      default:  // "after", default and unknown values
        let promise = remove.hide();
        return promise ? promise.then(() => <any>add.show()) : add.show();
    }
  }
}
