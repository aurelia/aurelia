import { IfCore } from "./if-core";
import { Scope } from "../binding/binding-interfaces";
import { If } from "./if";

export class Else extends IfCore {
  private ifBehavior: If;

  bind(scope: Scope) {
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
