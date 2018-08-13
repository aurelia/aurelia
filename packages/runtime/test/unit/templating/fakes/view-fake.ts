import {
  IView,
  IViewFactory,
  RenderCallback,
  MotionDirection,
  BindingFlags,
  IScope,
  INode,
  AttachLifecycle,
  DetachLifecycle,
  IRenderContext,
  IBindScope,
  IAttach,
  DOM,
  IViewSlot,
  INodeSequence
} from "@aurelia/runtime";

export class ViewFake implements IView {
  // IView impl
  factory: IViewFactory;

  parent: IViewSlot;
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
  $nodes: INodeSequence;
  $scope: IScope;
  $isBound: boolean;

  $bindables: IBindScope[];
  $attachables: IAttach[];

  constructor() {
    this.$bindables = [];
    this.$attachables = [];
    this.$nodes = DOM.createFactoryFromMarkupOrNode('<div></div>')();
  }
}
