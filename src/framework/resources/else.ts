import { IfCore } from "./if-core";
import { Scope } from "../binding/scope";
import { ViewSlot } from "../templating/view-slot";
import { IVisual } from "../templating/component";
import { If } from "./if";

export class Else extends IfCore {
  private ifBehavior: If;

  bind(scope: Scope) {
    super.bind(scope);

    // Render on initial
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
