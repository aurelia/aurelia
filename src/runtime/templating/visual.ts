import { IRender, IView } from "./view";
import { ITemplate, IViewOwner } from "./template";
import { IScope, IBindScope } from "../binding/binding-interfaces";
import { IAttach } from "./component";
import { IBinding } from "../binding/binding";

export interface IVisual extends IBindScope, IAttach, IRender, IViewOwner {
  isBound: boolean;
}

export class Visual implements IVisual {
  $bindable: IBinding[] = [];
  $attachable: IAttach[] = [];
  
  $view: IView;
  isBound = false;

  constructor(template: ITemplate) {
    this.$view = template.createFor(this);
  }

  bind(scope: IScope) {
    let bindable = this.$bindable;

    for (let i = 0, ii = bindable.length; i < ii; ++i) {
      bindable[i].bind(scope);
    }

    this.isBound = true;
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

    this.isBound = false;
  }
}
