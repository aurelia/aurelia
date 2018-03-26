import { IfCore } from "./if-core";
import { Scope } from "../binding/binding-interfaces";
import { Else } from "./else";
import { Observer } from "../binding/property-observation";

export class If extends IfCore {
  private animating = false;
  private elseBehavior: Else;

  $observers = {
    condition: new Observer(false, v => this.isBound ? this.conditionChanged(v) : void 0)
  };

  get condition() { return this.$observers.condition.getValue(); }
  set condition(value: boolean) { this.$observers.condition.setValue(value); }

  swapOrder: 'before' | 'with' | 'after';

  bind(scope: Scope) {
    super.bind(scope);
    this.conditionChanged(this.condition);
  }

  /**
  * Invoked every time value property changes.
  * @param newValue The new value
  */
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
        return Promise.resolve(add.show()).then(() => remove.hide());
      case 'with':
        return Promise.all([remove.hide(), add.show()]);
      default:  // "after", default and unknown values
        let promise = remove.hide();
        return promise ? promise.then(() => add.show()) : add.show();
    }
  }
}
