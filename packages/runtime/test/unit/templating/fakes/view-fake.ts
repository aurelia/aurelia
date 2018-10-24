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
  NodeSequenceFactory,
  LifecycleState
} from "../../../../src/index";

export class ViewFake implements IView {
  $nextBind: IBindScope = null;
  $prevBind: IBindScope = null;
  $bindableHead?: IBindScope = null;
  $bindableTail?: IBindScope = null;
  $attachableHead?: IAttach = null;
  $attachableTail?: IAttach = null;
  $nextAttach: IAttach = null;
  $prevAttach: IAttach = null;

  $state: LifecycleState = LifecycleState.none;

  lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = () => {
      this.$state |= LifecycleState.isBound;
    };
  }

  $addChild(child: IBindScope | IAttach, flags: BindingFlags): void {
  }

  $removeChild(child: IBindScope | IAttach): void {
  }

  $mount() {
    this.$state &= ~LifecycleState.needsMount;
    this.$nodes.insertBefore(this.location);
  }

  $unmount() {
    this.$state |= LifecycleState.needsMount;
    this.$nodes.remove();
  }

  $cache() {}

  hold(location: IRenderLocation): void {
    this.$state |= LifecycleState.needsMount;
    this.location = location;
  }

  release() {
    return this.isFree = true;
  }

  // IView impl
  cache: IViewFactory;
  location: IRenderLocation;
  private isFree: boolean = false;

  tryReturnToCache(): boolean {
    return true;
  }

  // IBindScope impl
  $bind(flags: BindingFlags, scope: IScope): void {
    this.$scope = scope;
    this.$state |= LifecycleState.isBound;
  }

  $unbind(): void {
    this.$state &= ~LifecycleState.isBound;
  }

  // IAttach impl
  $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void {
    if (this.$state & LifecycleState.needsMount) {
      lifecycle.queueMount(this);
    }
    this.$state |= LifecycleState.isAttached;
  }

  $detach(lifecycle: IDetachLifecycle): void {
    lifecycle.queueUnmount(this);
    this.$state &= ~LifecycleState.isAttached;
  }

  // IViewOwner impl
  $context: IRenderContext;
  $nodes: INodeSequence;
  $scope: IScope;

  $bindables: IBindScope[];
  $attachables: IAttach[];

  constructor() {
    this.$bindableHead = this.$bindableTail = null;
    this.$attachableHead = this.$attachableTail = null;
    this.$nodes = NodeSequenceFactory.createFor('<div>Fake View</div>').createNodeSequence();
  }
}
