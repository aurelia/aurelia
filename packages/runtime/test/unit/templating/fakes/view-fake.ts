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
  $isAttached: boolean = false;

  animate(direction: MotionDirection): void | Promise<boolean> {}
  tryReturnToCache(): boolean {
    return true;
  }

  // IBindScope impl
  $bind(flags: BindingFlags, scope: IScope): void {
    this.$scope = scope;
    this.$isBound = true;
  }

  $unbind(): void {
    this.$isBound = false;
  }

  // IAttach impl
  $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle): void {
    this.onRender(this);
    this.$isAttached = true;
  }

  $detach(lifecycle?: DetachLifecycle): void {
    this.$nodes.remove();
    this.$isAttached = false;
  }

  // IViewOwner impl
  $context: IRenderContext;
  $nodes: INodeSequence;
  $scope: IScope;
  $isBound: boolean = false;

  $bindables: IBindScope[];
  $attachables: IAttach[];

  constructor() {
    this.$bindables = [];
    this.$attachables = [];
    this.$nodes = DOM.createFactoryFromMarkupOrNode('<div></div>')();
  }
}
