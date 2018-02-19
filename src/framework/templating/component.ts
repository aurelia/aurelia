import { IObservable } from "../binding/binding";
import { View } from "./view";
import { Scope } from "../binding/scope";

export interface IBehavior extends IObservable {
  $scope: Scope;
  
  hydrate(anchor: Element);
  attach();
  detach();
}

export interface IVisual extends IBehavior {
  $view: View;
}

export interface IComponent extends IVisual {
  $anchor: Node;
}
