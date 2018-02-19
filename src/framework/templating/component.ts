import { IObservable, IBindScope } from "../binding/binding";
import { View, IView } from "./view";
import { Scope } from "../binding/scope";

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
  
}

export interface IComponent extends IBindSelf, IAttach, IRender, IObservable, IApplyToTarget  {
  
}
