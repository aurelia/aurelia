import { IfCore } from "./if-core";
import { IScope } from "../binding/binding-interfaces";
import { If } from "./if";
import { IContainer, Registration } from "../di";
import { IViewFactory } from "../templating/view-engine";
import { ViewSlot } from "../templating/view-slot";

export class Else extends IfCore {
  private ifBehavior: If;

  static inject = [IViewFactory, ViewSlot];

  static register(container: IContainer){
    container.register(Registration.transient('else', Else));
  }

  bind(scope: IScope) {
    super.bind(scope);

    if (this.ifBehavior.condition) {
      this.hide();
    } else {
      this.show();
    }
  }

  link(ifBehavior: If) {
    if (this.ifBehavior === ifBehavior) {
      return this;
    }

    this.ifBehavior = ifBehavior;
    ifBehavior.link(this);

    return this;
  }
}
