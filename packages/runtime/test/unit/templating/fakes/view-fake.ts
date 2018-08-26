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
} from "../../../../src/index";

export class ViewFake implements IView {
  // IView impl
  factory: IViewFactory;

  parent: IViewSlot;
  onRender: RenderCallback;
  renderState: any;
  $isAttached: boolean;

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
    this.$isAttached = true;
  }

  $detach(lifecycle?: DetachLifecycle): void {
    this.$isAttached = false;
  }

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
