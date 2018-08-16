import { inject } from '@aurelia/kernel';
import { bindable } from '../bindable';
import { templateController } from '../custom-attribute';
import { IViewFactory } from '../view';
import { IViewSlot, SwapOrder } from '../view-slot';
import { Else } from './else';
import { IfCore } from './if-core';
import { BindingFlags } from '../../binding';

@templateController('if')
@inject(IViewFactory, IViewSlot)
export class If extends IfCore {
  @bindable public swapOrder: SwapOrder = SwapOrder.after;
  @bindable public condition: boolean = false;

  private animating: boolean = false;
  private elseBehavior: Else;

  public conditionChanged(newValue: boolean): void { // can/should we get the flags in here from @templateController's $bind?
    this.update(newValue, BindingFlags.isChange);
  }

  public link(elseBehavior: Else): this {
    if (this.elseBehavior === elseBehavior) {
      return this;
    }

    this.elseBehavior = elseBehavior;
    elseBehavior.link(this);

    return this;
  }

  private update(show: boolean, flags: BindingFlags): void {
    if (this.animating) {
      return;
    }

    let promise;

    if (this.elseBehavior) {
      promise = show ? this.swap(this.elseBehavior, this, flags) : this.swap(this, this.elseBehavior, flags);
    } else {
      promise = show ? this.show(BindingFlags.isChange) : this.hide(BindingFlags.isChange);
    }

    if (promise) {
      this.animating = true;

      promise.then(() => {
        this.animating = false;

        if (this.condition !== this.showing) {
          this.update(this.condition, flags);
        }
      });
    }
  }

  private swap(remove: IfCore, add: IfCore, flags: BindingFlags) {
    switch (this.swapOrder) {
      case SwapOrder.before:
        return Promise.resolve(<any>add.show(flags)).then(() => remove.hide(flags));
      case SwapOrder.with:
        return Promise.all([<any>remove.hide(flags), add.show(flags)]);
      default:  // "after", default and unknown values
        let promise = remove.hide(flags);
        return promise ? promise.then(() => <any>add.show(flags)) : add.show(flags);
    }
  }
}
