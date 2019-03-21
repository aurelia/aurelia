import {
  DI,
  IContainer,
  IDisposable,
  IResolver,
  IServiceLocator,
  PLATFORM,
  Registration,
  Tracer,
  IIndexable,
  Ticker
} from '@aurelia/kernel';
import {
  ITargetedInstruction,
  TemplateDefinition,
  TemplatePartDefinitions,
  HooksDefinition
} from './definitions';
import {
  INode,
  INodeSequence,
  IRenderLocation
} from './dom';
import {
  LifecycleFlags,
  State
} from './flags';
import {
  IBatchChangeTracker,
  IRAFChangeTracker,
  IScope} from './observation';
import { IElementProjector } from './resources/custom-element';
import { Controller } from './templating/controller';

const slice = Array.prototype.slice;
export interface IState {
  $state: State;
  $lifecycle?: ILifecycle;
}

export interface IBinding {
  readonly locator: IServiceLocator;
  readonly $scope?: IScope;
  readonly $state: State;
  $bind(flags: LifecycleFlags, scope: IScope): void;
  $unbind(flags: LifecycleFlags): void;
}

export const enum ViewModelKind {
  customElement,
  customAttribute,
  synthetic
}

// TODO: extract 3 specialized interfaces for custom element / custom attribute / synthetic view
//  to keep the public API intuitive
export interface IController<T extends INode = INode> {
  nextBound?: IController<T>;
  nextUnbound?: IController<T>;
  prevBound?: IController<T>;
  prevUnbound?: IController<T>;

  nextAttached?: IController<T>;
  nextDetached?: IController<T>;
  prevAttached?: IController<T>;
  prevDetached?: IController<T>;

  nextMount?: IController<T>;
  nextUnmount?: IController<T>;
  prevMount?: IController<T>;
  prevUnmount?: IController<T>;

  readonly flags: LifecycleFlags;
  readonly viewCache?: IViewCache<T>;

  bindings?: IBinding[];
  controllers?: IController<T>[];

  state: State;

  readonly lifecycle: ILifecycle;

  readonly hooks: HooksDefinition;
  readonly viewModel?: ILifecycleHooks;
  readonly bindingContext?: IIndexable;

  readonly host?: T;

  readonly vmKind: ViewModelKind;

  scope?: IScope;
  projector?: IElementProjector;

  nodes?: INodeSequence<T>;
  context?: IRenderContext<T>;
  location?: IRenderLocation<T>;

  lockScope(scope: IScope): void;
  hold(location: IRenderLocation<T>): void;
  release(flags: LifecycleFlags): boolean;
  bind(flags: LifecycleFlags, scope?: IScope): ILifecycleTask;
  unbind(flags: LifecycleFlags): ILifecycleTask;
  bound(flags: LifecycleFlags): void;
  unbound(flags: LifecycleFlags): void;
  attach(flags: LifecycleFlags): void;
  detach(flags: LifecycleFlags): void;
  attached(flags: LifecycleFlags): void;
  detached(flags: LifecycleFlags): void;
  mount(flags: LifecycleFlags): void;
  unmount(flags: LifecycleFlags): void;
  cache(flags: LifecycleFlags): void;
}

export const IController = DI.createInterface<IController>('IController').noDefault();

export interface IRenderContext<T extends INode = INode> extends IServiceLocator {
  createChild(): IRenderContext<T>;
  render(flags: LifecycleFlags, renderable: IController<T>, targets: ArrayLike<object>, templateDefinition: TemplateDefinition, host?: T, parts?: TemplatePartDefinitions): void;
  beginComponentOperation(renderable: IController<T>, target: object, instruction: ITargetedInstruction, factory?: IViewFactory<T>, parts?: TemplatePartDefinitions, location?: IRenderLocation<T>, locationIsContainer?: boolean): IDisposable;
}

export interface IViewCache<T extends INode = INode> {
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  canReturnToCache(view: IController<T>): boolean;
  tryReturnToCache(view: IController<T>): boolean;
}

export interface IViewFactory<T extends INode = INode> extends IViewCache<T> {
  readonly name: string;
  create(flags?: LifecycleFlags): IController<T>;
}

export const IViewFactory = DI.createInterface<IViewFactory>('IViewFactory').noDefault();

/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends IState {
  created?(flags: LifecycleFlags): void;
  binding?(flags: LifecycleFlags): MaybePromiseOrTask;
  bound?(flags: LifecycleFlags): void;
  unbinding?(flags: LifecycleFlags): MaybePromiseOrTask;
  unbound?(flags: LifecycleFlags): void;
  attaching?(flags: LifecycleFlags): void;
  attached?(flags: LifecycleFlags): void;
  detaching?(flags: LifecycleFlags): void;
  detached?(flags: LifecycleFlags): void;
  caching?(flags: LifecycleFlags): void;
}

export interface ILifecycle {
  readonly rafCount: number;
  readonly batchCount: number;
  readonly patchCount: number;
  readonly boundCount: number;
  readonly mountCount: number;
  readonly attachedCount: number;
  readonly unmountCount: number;
  readonly detachedCount: number;
  readonly unboundCount: number;

  beginBind(requestor?: IController): void;
  beginUnbind(requestor?: IController): void;
  beginBatch(): void;

  endBind(flags: LifecycleFlags, requestor?: IController): void;
  endUnbind(flags: LifecycleFlags, requestor?: IController): void;
  endBatch(flags: LifecycleFlags): void;

  enqueueBound(requestor: IController): void;
  enqueueUnbound(requestor: IController): void;

  enqueueAttached(requestor: IController): void;
  enqueueDetached(requestor: IController): void;

  processBindQueue(flags: LifecycleFlags): void;
  processUnbindQueue(flags: LifecycleFlags): void;

  processAttachQueue(flags: LifecycleFlags): void;
  processDetachQueue(flags: LifecycleFlags): void;

  enqueueMount(requestor: IController): void;
  enqueueUnmount(requestor: IController): void;

  enqueueBatch(requestor: IBatchChangeTracker): void;
  enqueueRAF(requestor: IRAFChangeTracker): void;

  processBatchQueue(flags: LifecycleFlags): void;
  processRAFQueue(flags: LifecycleFlags): void;

  startTicking(ticker?: Ticker, frameBudget?: number): void;
  stopTicking(): void;

  registerDetachingTask(task: ILifecycleTask): void;
}

export const ILifecycle = DI.createInterface<ILifecycle>('ILifecycle').withDefault(x => x.singleton(Lifecycle));

const marker = Controller.forSyntheticView(
  PLATFORM.emptyObject as IViewCache,
  PLATFORM.emptyObject as ILifecycle,
);

/** @internal */
export class Lifecycle implements ILifecycle, IController {
  public batchDepth: number;
  public bindDepth: number;
  public patchDepth: number;
  public unbindDepth: number;

  public rafHead: IRAFChangeTracker;
  public rafTail: IRAFChangeTracker;

  public batchHead: IBatchChangeTracker;
  public batchTail: IBatchChangeTracker;

  public boundHead: IController;
  public boundTail: IController;

  public mountHead: IController;
  public mountTail: IController;

  public attachedHead: IController;
  public attachedTail: IController;

  public unmountHead: IController;
  public unmountTail: IController;

  public detachedHead: IController;
  public detachedTail: IController;

  public unboundHead: IController;
  public unboundTail: IController;

  public flushed?: Promise<void>;
  public promise: Promise<void>;

  public rafCount: number;
  public batchCount: number;
  public patchCount: number;
  public boundCount: number;
  public mountCount: number;
  public attachedCount: number;
  public unmountCount: number;
  public detachedCount: number;
  public unboundCount: number;

  // These are dummy properties to make the lifecycle conform to the interfaces
  // of the components it manages. This allows the lifecycle itself to be the first link
  // in the chain and removes the need for an additional null check on each addition.
  public $nextRAF: IRAFChangeTracker;
  public flushRAF: IRAFChangeTracker['flushRAF'];
  public $nextBatch: IBatchChangeTracker;
  public flushBatch: IBatchChangeTracker['flushBatch'];

  public nextBound?: IController;
  public nextUnbound?: IController;

  public nextAttached?: IController;
  public nextDetached?: IController;

  public nextMount?: IController;
  public nextUnmount?: IController;

  public flags: LifecycleFlags;
  public viewCache?: IViewCache;

  public bindings?: IBinding[];
  public controllers?: IController[];

  public state: State;

  public lifecycle: ILifecycle;

  public hooks: HooksDefinition;
  public bindingContext?: IIndexable;

  public host?: INode;

  public vmKind: ViewModelKind;

  public scope?: IScope;
  public projector?: IElementProjector;

  public nodes?: INodeSequence;
  public context?: IRenderContext;
  public location?: IRenderLocation;

  public lockScope: (scope: IScope) => void;
  public hold: (location: IRenderLocation) => void;
  public release: (flags: LifecycleFlags) => boolean;
  public bind: (flags: LifecycleFlags, scope?: IScope) => ILifecycleTask;
  public unbind: (flags: LifecycleFlags) => ILifecycleTask;
  public bound: (flags: LifecycleFlags) => void;
  public unbound: (flags: LifecycleFlags) => void;
  public attach: (flags: LifecycleFlags) => void;
  public detach: (flags: LifecycleFlags) => void;
  public attached: (flags: LifecycleFlags) => void;
  public detached: (flags: LifecycleFlags) => void;
  public mount: (flags: LifecycleFlags) => void;
  public unmount: (flags: LifecycleFlags) => void;
  public cache: (flags: LifecycleFlags) => void;

  public $state: State;

  public isFlushingRAF: boolean;

  public ticker: Ticker;
  public detachingTasks: ILifecycleTask[];

  public frameBudget: number;

  constructor() {
    this.batchDepth = 0;
    this.bindDepth = 0;
    this.patchDepth = 0;
    this.unbindDepth = 0;

    this.rafHead = this;
    this.rafTail = this;

    this.batchHead = this;
    this.batchTail = this;

    this.boundHead = marker;
    this.boundTail = marker;

    this.mountHead = marker;
    this.mountTail = marker;

    this.attachedHead = marker;
    this.attachedTail = marker;

    this.unmountHead = marker;
    this.unmountTail = marker;

    this.detachedHead = marker; //LOL
    this.detachedTail = marker;

    this.unboundHead = marker;
    this.unboundTail = marker;

    this.flushed = void 0;
    this.promise = Promise.resolve();

    this.rafCount = 0;
    this.batchCount = 0;
    this.patchCount = 0;
    this.boundCount = 0;
    this.mountCount = 0;
    this.attachedCount = 0;
    this.unmountCount = 0;
    this.detachedCount = 0;
    this.unboundCount = 0;

    this.$nextRAF = PLATFORM.emptyObject as this['$nextRAF'];
    this.flushRAF = PLATFORM.noop;
    this.$nextBatch = PLATFORM.emptyObject as this['$nextBatch'];
    this.flushBatch = PLATFORM.noop;

    this.nextBound = void 0;
    this.nextUnbound = void 0;

    this.nextAttached = void 0;
    this.nextDetached = void 0;

    this.nextMount = void 0;
    this.nextUnmount = void 0;

    this.flags = LifecycleFlags.none;
    this.viewCache = void 0;

    this.bindings = void 0;
    this.controllers = void 0;

    this.state = State.none;

    this.lifecycle = this;

    this.hooks = HooksDefinition.none;
    this.bindingContext = void 0;

    this.host = void 0;

    this.vmKind = -1;

    this.scope = void 0;
    this.projector = void 0;

    this.nodes = void 0;
    this.context = void 0;
    this.location = void 0;


    this.lockScope = PLATFORM.noop;
    this.hold = PLATFORM.noop;
    this.release = PLATFORM.noop as unknown as this['release'];
    this.bind = PLATFORM.noop as unknown as this['bind'];
    this.unbind = PLATFORM.noop as unknown as this['unbind'];
    this.bound = PLATFORM.noop;
    this.unbound = PLATFORM.noop;
    this.attach = PLATFORM.noop;
    this.detach = PLATFORM.noop;
    this.attached = PLATFORM.noop;
    this.detached = PLATFORM.noop;
    this.mount = PLATFORM.noop;
    this.unmount = PLATFORM.noop;
    this.cache = PLATFORM.noop;

    this.$state = State.none;

    this.isFlushingRAF = false;

    this.ticker = null!;
    this.detachingTasks = [];

    this.frameBudget = 10;
  }

  public static register(container: IContainer): IResolver<ILifecycle> {
    return Registration.singleton(ILifecycle, this).register(container);
  }

  public startTicking(ticker: Ticker = PLATFORM.ticker, frameBudget: number = 10): void {
    this.frameBudget = frameBudget;
    this.stopTicking();
    this.ticker = ticker;
    ticker.add(this.tick, void 0);
  }

  public stopTicking(): void {
    if (this.ticker !== null) {
      this.ticker.remove(this.tick, void 0);
    }
  }

  public beginBatch(): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'beginBatch', slice.call(arguments)); }
    ++this.batchDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public beginBind(requestor?: IController): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'beginBind', slice.call(arguments)); }
    if (requestor != void 0) {
      requestor.state |= State.isBinding;
    }
    ++this.bindDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public beginUnbind(requestor?: IController): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'beginUnbind', slice.call(arguments)); }
    if (requestor != void 0) {
      requestor.state |= State.isUnbinding;
    }
    ++this.unbindDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endBatch(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'endBatch', slice.call(arguments)); }
    if (--this.batchDepth === 0) {
      this.processBatchQueue(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endBind(flags: LifecycleFlags, requestor?: IController): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'endBind', slice.call(arguments)); }
    if (requestor != void 0) {
      requestor.state = requestor.state ^ State.isBinding | State.isBound;
    }
    if (--this.bindDepth === 0) {
      this.processBindQueue(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endUnbind(flags: LifecycleFlags, requestor?: IController): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'endUnbind', slice.call(arguments)); }
    if (requestor != void 0) {
      requestor.state = requestor.state ^ (State.isBinding | State.isBound);
    }
    if (--this.unbindDepth === 0) {
      this.processUnbindQueue(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueBound(requestor: IController): void {
    if (requestor.prevBound == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueBound', slice.call(arguments)); }
      requestor.prevBound = this.boundTail;
      this.boundTail.nextBound = requestor;
      this.boundTail = requestor;
      ++this.boundCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueUnbound(requestor: IController): void {
    if (requestor.prevUnbound == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueUnbound', slice.call(arguments)); }
      requestor.prevUnbound = this.unboundTail;
      this.unboundTail.nextUnbound = requestor;
      this.unboundTail = requestor;
      ++this.unboundCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueAttached(requestor: IController): void {
    if (requestor.prevAttached == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueAttached', slice.call(arguments)); }
      requestor.prevAttached = this.attachedTail;
      this.attachedTail.nextAttached = requestor;
      this.attachedTail = requestor;
      ++this.attachedCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueDetached(requestor: IController): void {
    if (requestor.prevDetached == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueDetached', slice.call(arguments)); }
      requestor.prevDetached = this.detachedTail;
      this.detachedTail.nextDetached = requestor;
      this.detachedTail = requestor;
      ++this.detachedCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public processBindQueue(flags: LifecycleFlags): void {
    // flushBatch before processing bound callbacks, but only if this is the initial bind;
    // no DOM is attached yet so we can safely let everything propagate
    if (flags & LifecycleFlags.fromStartTask) {
      ++this.bindDepth; // make sure any nested bound callbacks happen AFTER the ones already queued
      this.processBatchQueue(flags | LifecycleFlags.fromSyncFlush);
      --this.bindDepth;
    }
    while (this.boundCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processBindQueue', slice.call(arguments)); }
      this.boundCount = 0;
      let current = this.boundHead.nextBound;
      let next: IController | undefined;
      this.boundHead = this.boundTail = marker;
      while (current != void 0) {
        current.bound(flags);
        next = current.nextBound;
        current.nextBound = void 0;
        current.prevBound = void 0;
        current = next;
      }
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public processUnbindQueue(flags: LifecycleFlags): void {
    while (this.unboundCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processUnbindQueue', slice.call(arguments)); }
      this.unboundCount = 0;
      let current = this.boundHead.nextBound;
      let next: IController | undefined;
      this.boundHead = this.boundTail = marker;
      while (current != void 0) {
        current.bound(flags);
        next = current.nextUnbound;
        current.nextUnbound = void 0;
        current.prevUnbound = void 0;
        current = next;
      }
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public processAttachQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processAttachQueue', slice.call(arguments)); }
    // flushBatch and patch before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
    // and the DOM is updated
    this.processBatchQueue(flags | LifecycleFlags.fromSyncFlush);
    // TODO: prevent duplicate updates coming from the patch queue (or perhaps it's just not needed in its entirety?)
    //this.processPatchQueue(flags | LifecycleFlags.fromSyncFlush);

    if (this.mountCount > 0) {
      this.mountCount = 0;
      let currentMount = this.mountHead.nextMount;
      this.mountHead = this.mountTail = marker;
      let nextMount: IController | undefined;
      while (currentMount != void 0) {
        currentMount.bound(flags);
        nextMount = currentMount.nextMount;
        currentMount.nextMount = void 0;
        currentMount.prevMount = void 0;
        currentMount = nextMount;
      }
    }

    if (this.attachedCount > 0) {
      this.attachedCount = 0;
      let currentAttached = this.attachedHead.nextAttached;
      this.attachedHead = this.attachedTail = marker;
      let nextAttached: IController | undefined;
      while (currentAttached != void 0) {
        currentAttached.bound(flags);
        nextAttached = currentAttached.nextAttached;
        currentAttached.nextAttached = void 0;
        currentAttached.prevAttached = void 0;
        currentAttached = nextAttached;
      }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processDetachQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processDetachQueue', slice.call(arguments)); }
    // flushBatch before unmounting to ensure batched collection changes propagate to the repeaters,
    // which may lead to additional unmount operations
    this.processBatchQueue(flags | LifecycleFlags.fromFlush | LifecycleFlags.doNotUpdateDOM);

    if (this.detachingTasks.length > 0) {
      const tasks = this.detachingTasks.slice();
      this.detachingTasks = [];
      Promise.all(tasks.map(t => t.wait())).then(() => {
        this.processDetachQueue(flags);
      }).catch(e => { throw e; });
      return;
    }

    if (this.unmountCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processUnmountQueue', slice.call(arguments)); }
      this.unmountCount = 0;
      let currentUnmount = this.unmountHead.nextUnmount;
      this.unmountHead = this.unmountTail = marker;
      let nextUnmount: IController | undefined;

      while (currentUnmount != void 0) {
        currentUnmount.unmount(flags);
        nextUnmount = currentUnmount.nextUnmount;
        currentUnmount.prevUnmount = void 0;
        currentUnmount.nextUnmount = void 0;
        currentUnmount = nextUnmount;
      }
      if (Tracer.enabled) { Tracer.leave(); }
    }

    if (this.detachedCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processDetachedQueue', slice.call(arguments)); }
      this.detachedCount = 0;
      let currentDetached = this.detachedHead.nextDetached;
      this.detachedHead = this.detachedTail = marker;
      let nextDetached: IController | undefined;

      while (currentDetached != void 0) {
        currentDetached.unmount(flags);
        nextDetached = currentDetached.nextDetached;
        currentDetached.prevDetached = void 0;
        currentDetached.nextDetached = void 0;
        currentDetached = nextDetached;
      }
      if (Tracer.enabled) { Tracer.leave(); }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueMount(requestor: IController): void {
    if (requestor.prevMount == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueMount', slice.call(arguments)); }
      requestor.prevMount = this.mountTail;
      this.mountTail.nextMount = requestor;
      this.mountTail = requestor;
      ++this.mountCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueUnmount(requestor: IController): void {
    if (requestor.prevUnmount == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueUnmount', slice.call(arguments)); }
      requestor.prevUnmount = this.unmountTail;
      this.unmountTail.nextUnmount = requestor;
      this.unmountTail = requestor;
      ++this.unmountCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
    // this is a temporary solution until a cleaner method surfaces.
    // if an item being queued for unmounting is already in the mount queue,
    // remove it from the mount queue (this can occur in some very exotic situations
    // and should be dealt with in a less hacky way)
    if (requestor.prevMount != void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'dequeueMount', slice.call(arguments)); }
      if (requestor.nextMount != void 0) {
        requestor.prevMount.nextMount = requestor.nextMount;
        requestor.nextMount.prevMount = requestor.prevMount;
        requestor.nextMount = void 0;
      } else {
        requestor.prevMount.nextMount = void 0;
      }
      requestor.prevMount = void 0;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueBatch(requestor: IBatchChangeTracker): void {
    // Queue a flushBatch() callback; the depth is just for debugging / testing purposes and has
    // no effect on execution. flushBatch() will automatically be invoked when the promise resolves,
    // or it can be manually invoked synchronously.
    if (this.batchDepth === 0) {
      requestor.flushBatch(LifecycleFlags.fromSyncFlush);
    } else if (requestor.$nextBatch == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueBatch', slice.call(arguments)); }
      requestor.$nextBatch = PLATFORM.emptyObject as IBatchChangeTracker;
      this.batchTail.$nextBatch = requestor;
      this.batchTail = requestor;
      ++this.batchCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueRAF(requestor: IRAFChangeTracker): void {
    if (this.isFlushingRAF) {
      requestor.flushRAF(LifecycleFlags.fromSyncFlush);
    } else if (requestor.$nextRAF == void 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueRAF', slice.call(arguments)); }
      requestor.$nextRAF = PLATFORM.emptyObject as IRAFChangeTracker;
      this.rafTail.$nextRAF = requestor;
      this.rafTail = requestor;
      ++this.rafCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public processBatchQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processBatchQueue', slice.call(arguments)); }
    flags |= LifecycleFlags.fromSyncFlush;
    // flushBatch callbacks may lead to additional flushBatch operations, so keep looping until
    // the flushBatch head is back to `this` (though this will typically happen in the first iteration)
    while (this.batchCount > 0) {
      let current = this.batchHead.$nextBatch!;
      this.batchHead = this.batchTail = this;
      this.batchCount = 0;
      let next: typeof current;
      do {
        next = current.$nextBatch!;
        current.$nextBatch = void 0;
        current.flushBatch(flags);
        current = next;
      } while (current !== PLATFORM.emptyObject);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  // UGLY WIP WIP WIP - move along people
  public processRAFQueue(flags: LifecycleFlags): void {
    if (this.isFlushingRAF) {
      return;
    }
    // if (this.rafCount > 0) {
    //   const start = PLATFORM.now();
    //   const frameBudget = this.frameBudget;
    //   let i = 0;
    //   this.isFlushingRAF = true;
    //   let current = this.rafHead.$nextRAF;
    //   this.rafHead = this.rafTail = this;
    //   this.rafCount = 0;
    //   let next: typeof current;
    //   do {
    //     if (++i === 100) {
    //       i = 0;
    //       if (PLATFORM.now() - start > frameBudget) {
    //         this.rafHead.$nextRAF = current;
    //         next = current;
    //         while (next !== marker) {
    //           current = next;
    //           next = current.nextRAF;
    //         }
    //         this.rafTail = current;
    //         break;
    //       }
    //     }
    //     next = current.nextRAF;
    //     current.nextRAF = null;
    //     current.flushRAF(flags);
    //     current = next;
    //   } while (current !== marker);
    // }
    this.processDetachQueue(flags);
    this.processAttachQueue(flags);
    this.isFlushingRAF = false;
  }

  public registerDetachingTask(task: ILifecycleTask): void {
    this.detachingTasks.push(task);
  }

  private readonly tick = () => {
    this.processRAFQueue(LifecycleFlags.none);
  }
}

export type PromiseOrTask = Promise<unknown> | ILifecycleTask;
export type MaybePromiseOrTask = void | PromiseOrTask;

export const LifecycleTask = {
  done: {
    done: true,
    canCancel(): boolean { return false; },
    cancel(): void { return; },
    wait(): Promise<unknown> { return Promise.resolve(); }
  }
};

export interface ILifecycleTask<T = unknown> {
  readonly done: boolean;
  canCancel(): boolean;
  cancel(): void;
  wait(): Promise<T>;
}

export class PromiseTask<TArgs extends unknown[], T = void> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    promise: Promise<T>,
    next: ((result?: T, ...args: TArgs) => MaybePromiseOrTask) | null,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.isCancelled = false;
    this.hasStarted = false;
    this.promise = promise.then(value => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      if (next !== null) {
        // @ts-ignore
        const nextResult = next.call(context, value, ...args);
        if (nextResult === void 0) {
          this.done = true;
        } else {
          const nextPromise = (nextResult as Promise<unknown>).then instanceof Function
            ? nextResult as Promise<unknown>
            : (nextResult as ILifecycleTask).wait();
          return nextPromise.then(() => {
            this.done = true;
          });
        }
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class ContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    antecedent: Promise<unknown> | ILifecycleTask,
    next: (...args: TArgs) => MaybePromiseOrTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;

    const promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise = promise.then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args) as MaybePromiseOrTask;
      if (nextResult === void 0) {
        this.done = true;
      } else {
        const nextPromise = (nextResult as Promise<unknown>).then instanceof Function
          ? nextResult as Promise<unknown>
          : (nextResult as ILifecycleTask).wait();
        return nextPromise.then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class TerminalTask implements ILifecycleTask {
  public done: boolean;

  private readonly promise: Promise<unknown>;

  constructor(antecedent: Promise<unknown> | ILifecycleTask) {
    this.done = false;

    this.promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise.then(() => {
      this.done = true;
    }).catch(e => { throw e; });
  }

  public canCancel(): boolean {
    return false;
  }

  public cancel(): void {
    return;
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    antecedents: ILifecycleTask[],
    next: (...args: TArgs) => void | ILifecycleTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args) as undefined | ILifecycleTask;
      if (nextResult === void 0) {
        this.done = true;
      } else {
        return nextResult.wait().then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateTerminalTask implements ILifecycleTask {
  public done: boolean;

  private readonly promise: Promise<unknown>;

  constructor(antecedents: ILifecycleTask[]) {
    this.done = false;
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      this.done = true;
    });
  }

  public canCancel(): boolean {
    return false;
  }

  public cancel(): void {
    return;
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export function hasAsyncWork(value: MaybePromiseOrTask): value is PromiseOrTask {
  return !(value === void 0 || (value as ILifecycleTask).done === true);
}
