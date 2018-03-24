import { IRender, IView } from "./view";
import { ITemplate } from "./template";
import { Scope, IBindScope } from "../binding/binding-interfaces";
import { IAttach } from "./component";

export interface IVisual extends IBindScope, IAttach, IRender {
  isBound: boolean;
}

export class Visual implements IVisual {
  $view: IView;
  isBound = false;

  constructor(template: ITemplate) {
    this.$view = template.create();
  }

  bind(scope: Scope) {
    this.isBound = true;
  }

  unbind() {
    this.isBound = false;
  }

  attach() { }
  detach() { }
}
