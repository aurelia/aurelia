import {
  DI,
  IContainer,
  IDisposable,
  IIndexable,
  IResolver,
  IServiceLocator,
  PLATFORM,
  Registration,
  Tracer,
} from '@aurelia/kernel';

import {
  HooksDefinition,
  ITargetedInstruction,
  TemplateDefinition,
  TemplatePartDefinitions,
} from './definitions';
import {
  INode,
  INodeSequence,
  IRenderLocation,
} from './dom';
import {
  LifecycleFlags,
  State
} from './flags';
import { ILifecycleTask, MaybePromiseOrTask } from './lifecycle-task';
import {
  IBatchable,
  IBindingTargetAccessor,
  IScope,
} from './observation';
import { IElementProjector } from './resources/custom-element';

const slice = Array.prototype.slice;

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
export interface IController<
  T extends INode = INode,
  C extends IViewModel<T> = IViewModel<T>,
> {
  readonly id: number;

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
  readonly viewModel?: C;
  readonly bindingContext?: C & IIndexable;

  readonly host?: T;

  readonly vmKind: ViewModelKind;

  scope?: IScope;
  projector?: IElementProjector;

  nodes?: INodeSequence<T>;
  context?: IContainer | IRenderContext<T>;
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
  getTargetAccessor(propertyName: string): IBindingTargetAccessor | undefined;
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
export interface IViewModel<T extends INode = INode> {
  readonly $controller?: IController<T, this>;
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

export interface IHydratedViewModel<T extends INode = INode> extends IViewModel<T> {
  readonly $controller: IController<T, this>;
}

export interface ILifecycle {
  readonly FPS: number;
  readonly nextFrame: Promise<number>;
  minFPS: number;
  maxFPS: number;
  pendingChanges: number;

  readonly batchDepth: number;
  readonly boundCount: number;
  readonly mountCount: number;
  readonly attachedCount: number;
  readonly unmountCount: number;
  readonly detachedCount: number;
  readonly unboundCount: number;
  readonly isFlushingRAF: boolean;

  beginBatch(): void;
  endBatch(): void;
  enqueueBatch(requestor: IBatchable): void;
  batch(operation: (flags?: LifecycleFlags) => void, context?: unknown): void;

  beginBind(requestor?: IController): void;
  beginUnbind(requestor?: IController): void;

  endBind(flags: LifecycleFlags, requestor?: IController): void;
  endUnbind(flags: LifecycleFlags, requestor?: IController): void;

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

  enqueueRAF(cb: (flags: LifecycleFlags) => void, context?: unknown, priority?: Priority, once?: boolean): void;
  enqueueRAF(cb: () => void, context?: unknown, priority?: Priority, once?: boolean): void;
  dequeueRAF(cb: (flags: LifecycleFlags) => void, context?: unknown): void;
  dequeueRAF(cb: () => void, context?: unknown): void;

  processRAFQueue(flags: LifecycleFlags, timestamp?: number): void;

  startTicking(): void;
  stopTicking(): void;

  enableTimeslicing(): void;
  disableTimeslicing(): void;
}

class LinkedCallback {
  public cb?: (flags: LifecycleFlags) => void;
  public context?: unknown;
  public priority: Priority;
  public once: boolean;

  public next?: LinkedCallback;
  public prev?: LinkedCallback;

  public unlinked: boolean;

  public get first(): LinkedCallback {
    let cur: LinkedCallback = this;
    while (cur.prev !== void 0 && cur.prev.priority === this.priority) {
      cur = cur.prev;
    }
    return cur;
  }

  public get last(): LinkedCallback {
    let cur: LinkedCallback = this;
    while (cur.next !== void 0 && cur.next.priority === this.priority) {
      cur = cur.next;
    }
    return cur;
  }

  constructor(
    cb?: (() => void) | ((flags: LifecycleFlags) => void),
    context: unknown = void 0,
    priority: Priority = Priority.normal,
    once: boolean = false,
  ) {
    this.cb = cb;
    this.context = context;
    this.priority = priority;
    this.once = once;

    this.next = void 0;
    this.prev = void 0;

    this.unlinked = false;
  }

  public equals(fn: (() => void) | ((flags: LifecycleFlags) => void), context?: unknown): boolean {
    return this.cb === fn && this.context === context;
  }

  public call(flags: LifecycleFlags): LinkedCallback | undefined {
    if (this.cb !== void 0) {
      if (this.context !== void 0) {
        this.cb.call(this.context, flags);
      } else {
        this.cb(flags);
      }
    }

    if (this.once) {
      return this.unlink(true);
    } else if (this.unlinked) {
      const next = this.next;
      this.next = void 0;

      return next;
    } else {
      return this.next;
    }
  }

  public rotate(): void {
    if (this.prev === void 0 || this.prev.priority > this.priority) {
      return;
    }

    const { first, last } = this;

    const firstPrev = first.prev;
    const lastNext = last.next;
    const thisPrev = this.prev;

    this.prev = firstPrev;
    if (firstPrev !== void 0) {
      firstPrev.next = this;
    }

    last.next = first;
    first.prev = last;

    thisPrev.next = lastNext;
    if (lastNext !== void 0) {
      lastNext.prev = thisPrev;
    }
  }

  public link(prev: LinkedCallback): void {
    this.prev = prev;

    if (prev.next !== void 0) {
      prev.next.prev = this;
    }

    this.next = prev.next;
    prev.next = this;
  }

  public unlink(removeNext: boolean = false): LinkedCallback | undefined {
    this.unlinked = true;
    this.cb = void 0;
    this.context = void 0;

    if (this.prev !== void 0) {
      this.prev.next = this.next;
    }

    if (this.next !== void 0) {
      this.next.prev = this.prev;
    }

    this.prev = void 0;

    if (removeNext) {
      const { next } = this;
      this.next = void 0;
      return next;
    }

    return this.next;
  }
}

export const enum Priority {
  preempt   = 0x8000,
  high      = 0x7000,
  bind      = 0x6000,
  attach    = 0x5000,
  normal    = 0x4000,
  propagate = 0x3000,
  connect   = 0x2000,
  low       = 0x1000,
}

export const ILifecycle = DI.createInterface<ILifecycle>('ILifecycle').withDefault(x => x.singleton(Lifecycle));

const { min, max } = Math;

/** @internal */
export class Lifecycle implements ILifecycle {
  public static marker: IController;

  public batchQueue: IBatchable[];
  public batchDepth: number;

  public bindDepth: number;
  public unbindDepth: number;

  public rafHead: LinkedCallback;
  public rafTail: LinkedCallback;

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

  public boundCount: number;
  public mountCount: number;
  public attachedCount: number;
  public unmountCount: number;
  public detachedCount: number;
  public unboundCount: number;

  public $state: State;

  public isFlushingRAF: boolean;
  public rafRequestId: number;
  public rafStartTime: number;
  public isTicking: boolean;

  public minFrameDuration: number;
  public maxFrameDuration: number;
  public prevFrameDuration: number;

  public get FPS(): number {
    return 1000 / this.prevFrameDuration;
  }

  public get minFPS(): number {
    return 1000 / this.maxFrameDuration;
  }

  public set minFPS(fps: number) {
    this.maxFrameDuration = 1000 / min(max(0, min(this.maxFPS, fps)), 60);
  }

  public get maxFPS(): number {
    if (this.minFrameDuration > 0) {
      return 1000 / this.minFrameDuration;
    }
    return 60;
  }

  public set maxFPS(fps: number) {
    if (fps >= 60) {
      this.minFrameDuration = 0;
    } else {
      this.minFrameDuration = 1000 / min(max(1, max(this.minFPS, fps)), 60);
    }
  }

  public nextFrame: Promise<number>;
  public resolveNextFrame!: (timestamp: number) => void;

  public timeslicingEnabled: boolean;
  public adaptiveTimeslicing: boolean;
  public frameDurationFactor: number;
  public pendingChanges: number;

  private readonly tick: (timestamp: number) => void;

  constructor() {
    this.batchQueue = [];
    this.batchDepth = 0;

    this.bindDepth = 0;
    this.unbindDepth = 0;

    this.rafHead = new LinkedCallback(void 0, void 0, Infinity);
    this.rafTail = (void 0)!;

    this.boundHead = Lifecycle.marker;
    this.boundTail = Lifecycle.marker;

    this.mountHead = Lifecycle.marker;
    this.mountTail = Lifecycle.marker;

    this.attachedHead = Lifecycle.marker;
    this.attachedTail = Lifecycle.marker;

    this.unmountHead = Lifecycle.marker;
    this.unmountTail = Lifecycle.marker;

    this.detachedHead = Lifecycle.marker; //LOL
    this.detachedTail = Lifecycle.marker;

    this.unboundHead = Lifecycle.marker;
    this.unboundTail = Lifecycle.marker;

    this.flushed = void 0;
    this.promise = Promise.resolve();

    this.boundCount = 0;
    this.mountCount = 0;
    this.attachedCount = 0;
    this.unmountCount = 0;
    this.detachedCount = 0;
    this.unboundCount = 0;

    this.$state = State.none;

    this.isFlushingRAF = false;
    this.rafRequestId = -1;
    this.rafStartTime = -1;
    this.isTicking = false;

    this.minFrameDuration = 0;
    this.maxFrameDuration = 1000 / 30;
    this.prevFrameDuration = 0;

    // tslint:disable-next-line: promise-must-complete
    this.nextFrame = new Promise(resolve => {
      this.resolveNextFrame = resolve;
    });

    this.tick = (timestamp: number) => {
      this.rafRequestId = -1;
      if (this.isTicking) {
        this.processRAFQueue(LifecycleFlags.fromFlush, timestamp);
        if (this.isTicking && this.rafRequestId === -1 && this.rafHead.next !== void 0) {
          this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
        }
        this.resolveNextFrame(timestamp);
        // tslint:disable-next-line: promise-must-complete
        this.nextFrame = new Promise(resolve => {
          this.resolveNextFrame = resolve;
        });
      }
    };

    this.pendingChanges = 0;
    this.timeslicingEnabled = true;
    this.adaptiveTimeslicing = true;
    this.frameDurationFactor = 1;
  }

  public static register(container: IContainer): IResolver<ILifecycle> {
    return Registration.singleton(ILifecycle, this).register(container);
  }

  public startTicking(): void {
    if (!this.isTicking) {
      this.isTicking = true;
      if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
        this.rafStartTime = PLATFORM.now();
        this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
      }
    } else if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
      this.rafStartTime = PLATFORM.now();
      this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
    }
  }

  public stopTicking(): void {
    if (this.isTicking) {
      this.isTicking = false;
      if (this.rafRequestId !== -1) {
        PLATFORM.cancelAnimationFrame(this.rafRequestId);
        this.rafRequestId = -1;
      }
    } else if (this.rafRequestId !== -1) {
      PLATFORM.cancelAnimationFrame(this.rafRequestId);
      this.rafRequestId = -1;
    }
  }

  public beginBatch(): void {
    ++this.batchDepth;
  }

  public endBatch(): void {
    if (--this.batchDepth === 0) {
      const batch = this.batchQueue.slice();
      this.batchQueue = [];
      const { length } = batch;
      for (let i = 0; i < length; ++i) {
        batch[i].flushBatch(LifecycleFlags.fromFlush);
      }
    }
  }

  public batch(operation: (flags?: LifecycleFlags) => void, context?: unknown): void {
    // TODO: this is just temporary "to get it to work", needs to be made more efficient, avoid creating unnecessary objects etc
    const argLen = arguments.length;
    this.beginBatch();
    this.enqueueBatch({
      flushBatch(flags: LifecycleFlags): void {
        if (argLen === 2) {
          operation.call(context, flags);
        } else {
          operation(flags);
        }
      },
    });
    this.endBatch();
  }

  public enqueueBatch(requestor: IBatchable): void {
    this.batchQueue.push(requestor);
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
    while (this.boundCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processBindQueue', slice.call(arguments)); }
      this.boundCount = 0;
      let current = this.boundHead.nextBound;
      let next: IController | undefined;
      this.boundHead = this.boundTail = Lifecycle.marker;
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
      this.boundHead = this.boundTail = Lifecycle.marker;
      while (current != void 0) {
        current.unbound(flags);
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
    if (this.mountCount > 0) {
      this.mountCount = 0;
      let currentMount = this.mountHead.nextMount;
      this.mountHead = this.mountTail = Lifecycle.marker;
      let nextMount: IController | undefined;
      while (currentMount != void 0) {
        currentMount.mount(flags);
        nextMount = currentMount.nextMount;
        currentMount.nextMount = void 0;
        currentMount.prevMount = void 0;
        currentMount = nextMount;
      }
    }

    if (this.attachedCount > 0) {
      this.attachedCount = 0;
      let currentAttached = this.attachedHead.nextAttached;
      this.attachedHead = this.attachedTail = Lifecycle.marker;
      let nextAttached: IController | undefined;
      while (currentAttached != void 0) {
        currentAttached.attached(flags);
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
    if (this.unmountCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processUnmountQueue', slice.call(arguments)); }
      this.unmountCount = 0;
      let currentUnmount = this.unmountHead.nextUnmount;
      this.unmountHead = this.unmountTail = Lifecycle.marker;
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
      this.detachedHead = this.detachedTail = Lifecycle.marker;
      let nextDetached: IController | undefined;

      while (currentDetached != void 0) {
        currentDetached.detached(flags);
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

  public enqueueRAF(cb: (flags: LifecycleFlags) => void, context?: unknown, priority?: Priority, once?: boolean): void;
  public enqueueRAF(cb: () => void, context?: unknown, priority?: Priority, once?: boolean): void;
  public enqueueRAF(
    cb: (() => void) | ((flags: LifecycleFlags) => void),
    context: unknown = void 0,
    priority: Priority = Priority.normal,
    once: boolean = false,
  ): void {
    const node = new LinkedCallback(cb, context, priority, once);

    let prev = this.rafHead;
    let current = prev.next;
    if (current === void 0) {
      node.link(prev);
    } else {
      do {
        if (priority > current.priority || (priority === current.priority && once && !current.once)) {
          node.link(prev);
          break;
        }

        prev = current;
        current = current.next;
      } while (current !== void 0);

      if (node.prev === void 0) {
        node.link(prev);
      }
    }

    if (node.next === void 0) {
      this.rafTail = node;
    }

    this.startTicking();
  }

  public dequeueRAF(cb: (flags: LifecycleFlags) => void, context?: unknown): void;
  public dequeueRAF(cb: () => void, context?: unknown): void;
  public dequeueRAF(
    cb: (() => void) | ((flags: LifecycleFlags) => void),
    context: unknown = void 0,
  ): void {
    let current = this.rafHead.next;
    while (current !== void 0) {
      if (current.equals(cb, context)) {
        current = current.unlink();
      } else {
        current = current.next;
      }
    }
  }

  public processRAFQueue(flags: LifecycleFlags, timestamp: number = PLATFORM.now()): void {
    if (this.isFlushingRAF) {
      return;
    }

    this.isFlushingRAF = true;

    if (timestamp > this.rafStartTime) {
      const prevFrameDuration = this.prevFrameDuration = timestamp - this.rafStartTime;
      if (prevFrameDuration + 1 < this.minFrameDuration) {
        return;
      }

      let i = 0;
      if (this.adaptiveTimeslicing && this.maxFrameDuration > 0) {
        // Clamp the factor between 10 and 0.1 to prevent hanging or unjustified skipping during sudden shifts in workload
        this.frameDurationFactor = min(max(this.frameDurationFactor * (this.maxFrameDuration / prevFrameDuration), 0.1), 10);
      } else {
        this.frameDurationFactor = 1;
      }

      const deadlineLow = timestamp + max(this.maxFrameDuration * this.frameDurationFactor, 1);
      const deadlineNormal = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 5, 5);
      const deadlineHigh = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 15, 15);
      flags |= LifecycleFlags.fromTick;
      do {
        this.pendingChanges = 0;

        let current = this.rafHead.next;
        while (current !== void 0) {
          // only call performance.now() every 10 calls to reduce the overhead (is this low enough though?)
          if (this.timeslicingEnabled && ++i === 10) {
            i = 0;
            const { priority } = current;
            const now = PLATFORM.now();
            if (priority <= Priority.low) {
              if (now >= deadlineLow) {
                current.rotate();
                if (current.last != void 0 && current.last.next != void 0) {
                  current = current.last.next;
                } else {
                  break;
                }
              }
            } else if (priority < Priority.high) {
              if (now >= deadlineNormal) {
                current.rotate();
                if (current.last != void 0 && current.last.next != void 0) {
                  current = current.last.next;
                } else {
                  break;
                }
              }
            } else {
              if (now >= deadlineHigh) {
                current.rotate();
                if (current.last != void 0 && current.last.next != void 0) {
                  current = current.last.next;
                } else {
                  break;
                }
              }
            }
          }

          current = current.call(flags);
        }
      } while (this.pendingChanges > 0);

      if (this.rafHead.next === void 0) {
        this.stopTicking();
      }
    }

    this.rafStartTime = timestamp;
    this.isFlushingRAF = false;
  }

  public enableTimeslicing(adaptive: boolean = true): void {
    this.timeslicingEnabled = true;
    this.adaptiveTimeslicing = adaptive;
  }

  public disableTimeslicing(): void {
    this.timeslicingEnabled = false;
  }
}

