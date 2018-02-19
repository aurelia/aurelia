import { IfCore } from "./if-core";
import { Scope } from "../binding/scope";
import { Else } from "./else";

export class If extends IfCore {
  private animating = false;
  private elseBehavior: Else;

  condition: any;
  swapOrder: 'before'|'with'|'after';

  /**
  * Binds the if to the binding context and override context
  * @param bindingContext The binding context
  * @param overrideContext An override context for binding.
  */
  bind(scope: Scope) {
    super.bind(scope);

    if (this.condition) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
  * Invoked every time value property changes.
  * @param newValue The new value
  */
  conditionChanged(newValue) {
    this.update(newValue);
  }

  connect(elseBehavior: Else) {
    if (this.elseBehavior === elseBehavior) {
      return this;
    }

    this.elseBehavior = elseBehavior;
    elseBehavior.connect(this);
    
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
        return Promise.resolve(add.show()).then(() => remove.hide());
      case 'with':
        return Promise.all([ remove.hide(), add.show() ]);
      default:  // "after", default and unknown values
        let promise = remove.hide();
        return promise ? promise.then(() => add.show()) : add.show();
    }
  }
}
