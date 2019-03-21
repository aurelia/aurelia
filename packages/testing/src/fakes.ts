import {
  Hooks,
  IBinding,
  IChangeTracker,
  IComponent,
  IElementProjector,
  ILifecycle,
  IViewModel,
  IMountableComponent,
  INode,
  INodeSequence,
  IController,
  IRenderContext,
  IRenderLocation,
  IScope,
  IController,
  IViewCache,
  IViewFactory,
  LifecycleFlags,
  State
} from '@aurelia/runtime';

export class FakeRenderable<T extends INode = INode> implements IController<T> {
  public $bindingHead?: IBinding;
  public $bindingTail?: IBinding;

  public $componentHead?: IComponent;
  public $componentTail?: IComponent;

  public $nextComponent?: IComponent;
  public $prevComponent?: IComponent;

  public $nextMount?: IMountableComponent;
  public $nextUnmount?: IMountableComponent;

  public $state: State;
  public $scope: IScope;
  public $nodes!: INodeSequence<T>;
  public $context!: IRenderContext<T>;
  public $hooks: Hooks = 0;

  public $lifecycle: ILifecycle;

  public $projector: IElementProjector;

  public $nextFlush: IChangeTracker;
  public $nextBound: IViewModel;
  public $nextUnbound: IViewModel;
  public $nextAttached: IViewModel;
  public $nextDetached: IViewModel;

  constructor() {
    this.$state = State.none;
    this.$scope = null!;

    this.$lifecycle = null!;
    this.$projector = null!;
    this.$nextFlush = null!;
    this.$nextBound = null!;
    this.$nextUnbound = null!;
    this.$nextAttached = null!;
    this.$nextDetached = null!;
  }
}

export class FakeViewFactory<T extends INode = INode> implements IViewFactory<T> {
  public static get inject(): unknown[] { return [ILifecycle] };

  public name: string;
  public isCaching: boolean;

  public readonly lifecycle: ILifecycle;
  public readonly createView: (factory: FakeViewFactory<T>) => IController<T>;

  constructor(name: string, createView: (factory: FakeViewFactory<T>) => IController<T>, lifecycle: ILifecycle) {
    this.isCaching = false;
    this.name = name;

    this.lifecycle = lifecycle;
    this.createView = createView;
  }

  public canReturnToCache(view: IController): boolean {
    return false;
  }
  public tryReturnToCache(view: IController): boolean {
    return false;
  }
  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void { return; }
  public create(): IController<T> {
    return this.createView(this);
  }
}

export class FakeView<T extends INode = INode> implements IController<T> {
  public $bindingHead?: IBinding;
  public $bindingTail?: IBinding;

  public $componentHead?: IComponent;
  public $componentTail?: IComponent;

  public $nextComponent?: IComponent;
  public $prevComponent?: IComponent;

  public $nextMount?: IMountableComponent;
  public $nextUnmount?: IMountableComponent;

  public $nextUnbindAfterDetach?: IComponent;

  public $state: State;
  public $scope: IScope;
  public $nodes!: INodeSequence<T>;
  public $context!: IRenderContext<T>;
  public cache: IViewCache<T>;
  public location!: IRenderLocation<T>;
  public isFree: boolean;

  public readonly $lifecycle: ILifecycle;

  constructor($lifecycle: ILifecycle, cache: IViewCache<T> | null) {
    this.$state = State.none;
    this.$scope = null!;
    this.isFree = false;

    this.$lifecycle = $lifecycle;
    this.cache = cache!;
  }

  public hold(location: IRenderLocation): void {
    this.location = location;
  }

  public release() {
    this.isFree = true;
    return false;
  }

  public lockScope(scope: IScope): void {
    this.$scope = scope;
    this.$bind = () => {
      this.$state |= State.isBound;
    };
    this.$unbind = () => {
      this.$state &= ~State.isBound;
    };
  }

  public $bind(flags: LifecycleFlags, scope: IScope): void {
    this.$scope = scope;
    this.$state |= State.isBound;
  }

  public $unbind(): void {
    this.$state &= ~State.isBound;
  }

  public $attach(): void {
    this.$lifecycle.enqueueMount(this);
    this.$state |= State.isAttached;
  }

  public $detach(): void {
    this.$lifecycle.enqueueUnmount(this);
    this.$state &= ~State.isAttached;
  }

  public $cache() { /* do nothing */ }

  public $mount() {
    this.$state |= State.isMounted;
    this.$nodes.insertBefore(this.location);
  }

  public $unmount() {
    this.$state &= ~State.isMounted;
    this.$nodes.remove();
  }
}
