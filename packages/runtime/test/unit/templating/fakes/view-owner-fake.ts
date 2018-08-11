import {
  IRenderContext,
  IView,
  IBindScope,
  IAttach,
  IScope,
  IViewOwner
} from "@aurelia/runtime";

export class ViewOwnerFake implements IViewOwner {
  $context: IRenderContext;
  $view: IView;
  $scope: IScope;
  $isBound: boolean;

  $bindable: IBindScope[];
  $attachable: IAttach[];

  constructor() {
    this.$bindable = [];
    this.$attachable = [];
  }
}
