import {
  IView,
  IViewFactory,
  LifecycleFlags,
  IScope,
  INode,
  IRenderContext,
  IBindScope,
  IAttach,
  INodeSequence,
  IRenderLocation,
  ILifecycle,
  Lifecycle,
  NodeSequenceFactory,
  State,
  IMountable,
  ILifecycleUnbind,
  DOM
} from "../../../../src/index";

const dom = new DOM(<any>document);

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
  public $nextUnmount: IMountable = null;

  public $nextUnbindAfterDetach: ILifecycleUnbind = null;

  public $state: State = State.none;
  public $scope: IScope = null;
  public $nodes: INodeSequence;
  public $context: IRenderContext;
  public location: IRenderLocation;
  public isFree: boolean = false;

  public cache: IViewFactory;

  constructor(public $lifecycle: Lifecycle) {
    this.$nodes = new NodeSequenceFactory(dom, '<div>Fake View</div>').createNodeSequence();
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
    this.$state |= State.isMounted;
    this.$nodes.insertBefore(this.location);
  }

  public $unmount() {
    this.$state &= ~State.isMounted;
    this.$nodes.remove();
  }

  public $cache() {}

  public hold(location: IRenderLocation): void {
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
    this.$lifecycle.enqueueMount(this);
    this.$state |= State.isAttached;
  }

  public $detach(): void {
    this.$lifecycle.enqueueUnmount(this);
    this.$state &= ~State.isAttached;
  }
}
