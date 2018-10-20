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
  IAttachLifecycle,
  NodeSequenceFactory
} from "../../../../src/index";

export class ViewFake implements IView {
  $nextBindable: IBindScope = null;
  $prevBindable: IBindScope = null;
  $bindableHead?: IBindScope = null;
  $bindableTail?: IBindScope = null;
  $attachableHead?: IAttach = null;
  $attachableTail?: IAttach = null;
  $nextAttachable: IAttach = null;
  $prevAttachable: IAttach = null;

  $isCached: boolean = false;
  $needsMount: boolean = false;
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

  $mount() {
    this.$nodes.insertBefore(this.location);
  }

  $unmount() {
    this.$needsMount = true;
    this.$nodes.remove();
  }

  $cache() {}

  hold(location: IRenderLocation): void {
    this.$needsMount = true;
    this.location = location;
  }

  release() {
    return this.isFree = true;
  }

  // IView impl
  cache: IViewFactory;
  $isAttached: boolean = false;
  location: IRenderLocation;
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
    if (this.$needsMount) {
      lifecycle.queueMount(this);
    }

    this.$isAttached = true;
  }

  $detach(lifecycle: IDetachLifecycle): void {
    lifecycle.queueUnmount(this);
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
    this.$bindableHead = this.$bindableTail = null;
    this.$attachableHead = this.$attachableTail = null;
    this.$nodes = NodeSequenceFactory.createFor('<div>Fake View</div>').createNodeSequence();
  }
}
