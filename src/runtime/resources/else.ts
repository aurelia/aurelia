import { IfCore } from "./if-core";
import { IScope } from "../binding/binding-interfaces";
import { If } from "./if";
import { IViewResources } from "../templating/view-resources";

export class Else extends IfCore {
  private ifBehavior: If;

  static registerResources(registry: IViewResources){
    registry.registerAttribute('else', If);
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
