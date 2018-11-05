import {
  IView,
  IViewFactory,
  LifecycleFlags,
  IScope,
  INode,
  IRenderContext,
  IBindScope,
  IAttach,
  DOM,
  INodeSequence,
  IRenderLocation,
  ILifecycle,
  ILifecycle,
  NodeSequenceFactory,
  State
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

  $state: State = State.none;

  lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = () => {
      this.$state |= State.isBound;
    };
  }

  $addChild(child: IBindScope | IAttach, flags: LifecycleFlags): void {
  }

  $removeChild(child: IBindScope | IAttach): void {
  }

  $mount() {
    this.$state &= ~State.needsMount;
    this.$nodes.insertBefore(this.location);
  }

  $unmount() {
    this.$state |= State.needsMount;
    this.$nodes.remove();
  }

  $cache() {}

  hold(location: IRenderLocation): void {
    this.$state |= State.needsMount;
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
  $bind(flags: LifecycleFlags, scope: IScope): void {
    this.$scope = scope;
    this.$state |= State.isBound;
  }

  $unbind(): void {
    this.$state &= ~State.isBound;
  }

  // IAttach impl
  $attach(): void {
    if (this.$state & State.needsMount) {
      this.lifecycle.queueMount(this);
    }
    this.$state |= State.isAttached;
  }

  $detach(): void {
    this.lifecycle.queueUnmount(this);
    this.$state &= ~State.isAttached;
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
