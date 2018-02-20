import { IObservable, IBindScope } from "../binding/binding";
import { View, IView } from "./view";
import { Scope } from "../binding/scope";
import { Template } from "../new";

export interface IBindSelf {
  bind();
  unbind();
}
export interface IAttach {
  attach();
  detach();
}

export interface IRender {
  $view: IView;
}

export interface IApplyToTarget {
  applyTo(target: Element);
}

export interface IVisual extends IBindScope, IAttach, IRender {
  isBound: boolean;
}

export interface IComponent extends IBindSelf, IAttach, IObservable, IApplyToTarget  {
  
}

export class Visual implements IVisual {
  $view: View;
  isBound = false;

  constructor(template: Template) {
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
