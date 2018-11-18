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
  Lifecycle,
  NodeSequenceFactory,
  State,
  IMountable,
  ILifecycleUnbind
} from "../../../../src/index";

export class ViewFake implements IView {
  public $bindableHead: IBindScope = null;
  public $bindableTail: IBindScope = null;

  public $nextBind: IBindScope = null;
  public $prevBind: IBindScope = null;

  public $attachableHead: IAttach = null;
  public $attachableTail: IAttach = null;

  public $nextAttach: IAttach = null;
  public $prevAttach: IAttach = null;

  public $nextMount: IMountable = null;
  public $mountFlags: LifecycleFlags = 0;
  public $nextUnmount: IMountable = null;
  public $unmountFlags: LifecycleFlags = 0;

  public $nextUnbindAfterDetach: ILifecycleUnbind = null;

  public $state: State = State.none;
  public $scope: IScope = null;
  public $nodes: INodeSequence;
  public $context: IRenderContext;
  public location: IRenderLocation;
  public isFree: boolean = false;

  public cache: IViewFactory;

  constructor(public $lifecycle: Lifecycle) {
    this.$nodes = NodeSequenceFactory.createFor('<div>Fake View</div>').createNodeSequence();
  }

  public lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = () => {
      this.$state |= State.isBound;
    };
  }

  public $addChild(child: IBindScope | IAttach, flags: LifecycleFlags): void {
  }

  public $removeChild(child: IBindScope | IAttach): void {
  }

  public $mount() {
    this.$state &= ~State.needsMount;
    this.$nodes.insertBefore(this.location);
  }

  public $unmount() {
    this.$state |= State.needsMount;
    this.$nodes.remove();
  }

  public $cache() {}

  public hold(location: IRenderLocation): void {
    this.$state |= State.needsMount;
    this.location = location;
  }

  public release() {
    return this.isFree = true;
  }

  public tryReturnToCache(): boolean {
    return true;
  }

  // IBindScope impl
  public $bind(flags: LifecycleFlags, scope: IScope): void {
    this.$scope = scope;
    this.$state |= State.isBound;
  }

  public $unbind(): void {
    this.$state &= ~State.isBound;
  }

  // IAttach impl
  public $attach(): void {
    if (this.$state & State.needsMount) {
      this.$lifecycle.enqueueMount(this);
    }
    this.$state |= State.isAttached;
  }

  public $detach(): void {
    this.$lifecycle.enqueueUnmount(this);
    this.$state &= ~State.isAttached;
  }
}
