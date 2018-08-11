import {
  IVisual,
  IVisualFactory,
  IRenderSlot,
  RenderCallback,
  MotionDirection,
  BindingFlags,
  IScope,
  INode,
  AttachLifecycle,
  DetachLifecycle,
  IRenderContext,
  IView,
  IBindScope,
  IAttach,
  DOM
} from "@aurelia/runtime";

export class VisualFake implements IVisual {
  // IVisual impl
  factory: IVisualFactory;

  parent: IRenderSlot;
  onRender: RenderCallback;
  renderState: any;

  animate(direction: MotionDirection): void | Promise<boolean> {}
  tryReturnToCache(): boolean {
    return true;
  }

  // IBindScope impl
  $bind(flags: BindingFlags, scope: IScope): void {
    this.$scope = scope;
  }

  $unbind(): void {}

  // IAttach impl
  $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle): void {}
  $detach(lifecycle?: DetachLifecycle): void {}

  // IViewOwner impl
  $context: IRenderContext;
  $view: IView;
  $scope: IScope;
  $isBound: boolean;

  $bindable: IBindScope[];
  $attachable: IAttach[];

  constructor() {
    this.$bindable = [];
    this.$attachable = [];
    this.$view = DOM.createFactoryFromMarkupOrNode('<div></div>')();
  }
}
