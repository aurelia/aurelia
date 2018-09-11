import {
  IView,
  IViewFactory,
  RenderCallback,
  BindingFlags,
  IScope,
  INode,
  AttachLifecycle,
  DetachLifecycle,
  IRenderContext,
  IBindScope,
  IAttach,
  DOM,
  INodeSequence
} from "../../../../src/index";

export class ViewFake implements IView {
  lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = () => {
      this.$isBound = true;
    };
  }

  $addChild(child: IBindScope | IAttach, flags: BindingFlags): void {
  }

  $removeChild(child: IBindScope | IAttach): void {
  }

  // IView impl
  factory: IViewFactory;

  onRender: RenderCallback;
  renderState: any;
  $isAttached: boolean = false;

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
    this.$nodes = DOM.createFactoryFromMarkupOrNode('<div>Fake View</div>')();
  }
}
