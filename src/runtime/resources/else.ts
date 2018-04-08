import { IfCore } from "./if-core";
import { If } from "./if";
import { IViewFactory } from "../templating/view-engine";
import { ViewSlot } from "../templating/view-slot";
import { inject, templateController, customAttribute } from "../decorators";
import { IScope } from "../binding/binding-context";

@customAttribute('else')
@templateController
@inject(IViewFactory, ViewSlot)
export class Else extends IfCore {
  private ifBehavior: If;

  bound(scope: IScope) {
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
