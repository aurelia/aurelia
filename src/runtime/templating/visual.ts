import { IRender, IView, IViewOwner } from "./view";
import { ITemplate } from "./template";
import { IScope, IBindScope } from "../binding/binding-interfaces";
import { IAttach } from "./component";

export interface IVisual extends IBindScope, IAttach, IViewOwner { }

export abstract class Visual implements IVisual {
  $bindable: IBindScope[] = [];
  $attachable: IAttach[] = [];
  $scope: IScope;
  $view: IView;
  $isBound = false;

  constructor() {
    this.$view = this.createView();
  }

  abstract createView(): IView;

  bind(scope: IScope) {
    this.$scope = scope;

    let bindable = this.$bindable;

    for (let i = 0, ii = bindable.length; i < ii; ++i) {
      bindable[i].bind(scope);
    }

    this.$isBound = true;
  }

  attach() {
    let attachable = this.$attachable;

    for (let i = 0, ii = attachable.length; i < ii; ++i) {
      attachable[i].attach();
    }
  }

  detach() { 
    let attachable = this.$attachable;
    let i = attachable.length;

    while (i--) {
      attachable[i].detach();
    }
  }

  unbind() {
    let bindable = this.$bindable;
    let i = bindable.length;

    while (i--) {
      bindable[i].unbind();
    }

    this.$isBound = false;
  }
}
