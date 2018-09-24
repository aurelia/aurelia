import {
  IView,
  IViewFactory,
  BindingFlags,
  IScope,
  INode,
  IRenderContext,
  IBindScope,
  IAttach,
  DOM,
  INodeSequence,
  IRenderLocation,
  IDetachLifecycle,
  IAttachLifecycle
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

  $addNodes() {
    this.$nodes.insertBefore(this.location);
  }

  $removeNodes() {
    this.mountRequired = true;
    this.$nodes.remove();
  }

  $cache() {}

  mount(location: IRenderLocation): void {
    this.mountRequired = true;
    this.location = location;
  }

  release() {
    return this.isFree = true;
  }

  // IView impl
  factory: IViewFactory;
  $isAttached: boolean = false;
  location: IRenderLocation;
  mountRequired = false;
  private isFree: boolean = false;

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
  $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    if (this.mountRequired) {
      lifecycle.queueAddNodes(this);
    }

    this.$isAttached = true;
  }

  $detach(lifecycle: IDetachLifecycle): void {
    lifecycle.queueRemoveNodes(this);
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
