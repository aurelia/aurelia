import {
  IView,
  IViewFactory,
  BindingFlags,
  IScope,
  INode,
  AttachLifecycle,
  DetachLifecycle,
  IRenderContext,
  IBindScope,
  IAttach,
  DOM,
  INodeSequence,
  IRenderLocation
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

  $removeNodes() {
    this.mountRequired = true;
    this.$nodes.remove();
  }

  mount(location: IRenderLocation): void {
    this.mountRequired = true;
    this.location = location;
  }

  // IView impl
  factory: IViewFactory;
  $isAttached: boolean = false;
  location: IRenderLocation;
  mountRequired = false;

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
    if (this.mountRequired) {
      this.$nodes.insertBefore(this.location);
    }

    this.$isAttached = true;
  }

  $detach(lifecycle?: DetachLifecycle): void {
    lifecycle = DetachLifecycle.start(this, lifecycle);
    lifecycle.queueNodeRemoval(this);
    this.$isAttached = false;
    lifecycle.end(this);
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
