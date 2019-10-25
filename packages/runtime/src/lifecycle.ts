import {
  DI,
  IContainer,
  IDisposable,
  IIndexable,
  IResolver,
  IServiceLocator,
  PLATFORM,
  Registration,
} from '@aurelia/kernel';
import {
  HooksDefinition,
  ITargetedInstruction,
  PartialCustomElementDefinitionParts,
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
import {
  ILifecycleTask,
  MaybePromiseOrTask,
} from './lifecycle-task';
import {
  IBatchable,
  IBindingTargetAccessor,
  IScope,
} from './observation';
import {
  IElementProjector,
  CustomElementDefinition,
} from './resources/custom-element';

export interface IBinding {
  readonly locator: IServiceLocator;
  readonly $scope?: IScope;
  readonly part?: string;
  readonly $state: State;
  $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
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

  nextBound?: IController<T, C>;
  nextUnbound?: IController<T, C>;
  prevBound?: IController<T, C>;
  prevUnbound?: IController<T, C>;

  nextAttached?: IController<T, C>;
  nextDetached?: IController<T, C>;
  prevAttached?: IController<T, C>;
  prevDetached?: IController<T, C>;

  nextMount?: IController<T, C>;
  nextUnmount?: IController<T, C>;
  prevMount?: IController<T, C>;
  prevUnmount?: IController<T, C>;

  readonly flags: LifecycleFlags;
  readonly viewCache?: IViewCache<T>;

  parent?: IController<T>;
  bindings?: IBinding[];
  controllers?: IController<T>[];

  state: State;

  readonly lifecycle: ILifecycle;

  readonly hooks: HooksDefinition;
  readonly viewModel?: C;
  readonly bindingContext?: C & IIndexable;

  readonly host?: T;

  readonly vmKind: ViewModelKind;

  readonly scopeParts?: readonly string[];
  readonly isStrictBinding?: boolean;

  scope?: IScope;
  part?: string;
  projector?: IElementProjector;

  nodes?: INodeSequence<T>;
  context?: IContainer | IRenderContext<T>;
  location?: IRenderLocation<T>;

  lockScope(scope: IScope): void;
  hold(location: IRenderLocation<T>, mountStrategy: MountStrategy): void;
  release(flags: LifecycleFlags): boolean;
  bind(flags: LifecycleFlags, scope?: IScope, partName?: string): ILifecycleTask;
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

/**
 * Describing characteristics of a mounting operation a controller will perform
 */
export const enum MountStrategy {
  insertBefore = 1,
  append = 2,
}

export interface IRenderContext<T extends INode = INode> extends IContainer {
  readonly parentId: number;
  render(
    flags: LifecycleFlags,
    renderable: IController<T>,
    targets: ArrayLike<object>,
    templateDefinition: CustomElementDefinition,
    host?: T,
    parts?: PartialCustomElementDefinitionParts,
  ): void;
  beginComponentOperation(
    renderable: IController<T>,
    target: object,
    instruction: ITargetedInstruction,
    factory?: IViewFactory<T> | null,
    parts?: PartialCustomElementDefinitionParts,
    location?: IRenderLocation<T>,
    locationIsContainer?: boolean,
  ): IDisposable;
}

export interface IViewCache<T extends INode = INode> {
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  canReturnToCache(view: IController<T>): boolean;
  tryReturnToCache(view: IController<T>): boolean;
}

export interface IViewFactory<T extends INode = INode> extends IViewCache<T> {
  readonly parentContextId: number;
  readonly name: string;
  readonly parts: PartialCustomElementDefinitionParts;
  create(flags?: LifecycleFlags): IController<T>;
  addParts(parts: PartialCustomElementDefinitionParts): void;
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
  readonly batch: IAutoProcessingQueue<IBatchable>;

  readonly mount: IProcessingQueue<IController>;
  readonly unmount: IProcessingQueue<IController>;

  readonly bound: IAutoProcessingQueue<IController>;
  readonly unbound: IAutoProcessingQueue<IController>;

  readonly attached: IAutoProcessingQueue<IController>;
  readonly detached: IAutoProcessingQueue<IController>;
}

export const ILifecycle = DI.createInterface<ILifecycle>('ILifecycle').withDefault(x => x.singleton(Lifecycle));

export interface IProcessingQueue<T> {
  add(requestor: T): void;
  remove(requestor: T): void;
  process(flags: LifecycleFlags): void;
}

export interface IAutoProcessingQueue<T> extends IProcessingQueue<T> {
  readonly depth: number;
  begin(): void;
  end(flags?: LifecycleFlags): void;
  inline(fn: () => void, flags?: LifecycleFlags): void;
}

export class BoundQueue implements IAutoProcessingQueue<IController> {
  public readonly lifecycle: ILifecycle;

  public depth: number;

  public head?: IController;
  public tail?: IController;

  public constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;

    this.depth = 0;

    this.head = void 0;
    this.tail = void 0;
  }

  public begin(): void {
    ++this.depth;
  }

  public end(flags?: LifecycleFlags): void {
    if (flags === void 0) {
      flags = LifecycleFlags.none;
    }
    if (--this.depth === 0) {
      this.process(flags);
    }
  }

  public inline(fn: () => void, flags?: LifecycleFlags): void {
    this.begin();
    fn();
    this.end(flags);
  }

  public add(controller: IController): void {
    if (this.head === void 0) {
      this.head = controller;
    } else {
      controller.prevBound = this.tail;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tail!.nextBound = controller; // implied by boundHead not being undefined
    }
    this.tail = controller;
    controller.state |= State.inBoundQueue;
  }

  public remove(controller: IController): void {
    if (controller.prevBound !== void 0) {
      controller.prevBound.nextBound = controller.nextBound;
    }
    if (controller.nextBound !== void 0) {
      controller.nextBound.prevBound = controller.prevBound;
    }
    controller.prevBound = void 0;
    controller.nextBound = void 0;
    if (this.tail === controller) {
      this.tail = controller.prevBound;
    }
    if (this.head === controller) {
      this.head = controller.nextBound;
    }
    controller.state = (controller.state | State.inBoundQueue) ^ State.inBoundQueue;
  }

  public process(flags: LifecycleFlags): void {
    while (this.head !== void 0) {
      let cur = this.head;
      this.head = this.tail = void 0;
      let next: IController | undefined;
      do {
        cur.state = (cur.state | State.inBoundQueue) ^ State.inBoundQueue;
        cur.bound(flags);
        next = cur.nextBound;
        cur.nextBound = void 0;
        cur.prevBound = void 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cur = next!; // we're checking it for undefined the next line
      } while (cur !== void 0);
    }
  }
}

export class UnboundQueue implements IAutoProcessingQueue<IController> {
  public readonly lifecycle: ILifecycle;

  public depth: number;

  public head?: IController;
  public tail?: IController;

  public constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;

    this.depth = 0;

    this.head = void 0;
    this.tail = void 0;
  }

  public begin(): void {
    ++this.depth;
  }

  public end(flags?: LifecycleFlags): void {
    if (flags === void 0) {
      flags = LifecycleFlags.none;
    }
    if (--this.depth === 0) {
      this.process(flags);
    }
  }

  public inline(fn: () => void, flags?: LifecycleFlags): void {
    this.begin();
    fn();
    this.end(flags);
  }

  public add(controller: IController): void {
    if (this.head === void 0) {
      this.head = controller;
    } else {
      controller.prevUnbound = this.tail;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tail!.nextUnbound = controller; // implied by unboundHead not being undefined
    }
    this.tail = controller;
    controller.state |= State.inUnboundQueue;
  }

  public remove(controller: IController): void {
    if (controller.prevUnbound !== void 0) {
      controller.prevUnbound.nextUnbound = controller.nextUnbound;
    }
    if (controller.nextUnbound !== void 0) {
      controller.nextUnbound.prevUnbound = controller.prevUnbound;
    }
    controller.prevUnbound = void 0;
    controller.nextUnbound = void 0;
    if (this.tail === controller) {
      this.tail = controller.prevUnbound;
    }
    if (this.head === controller) {
      this.head = controller.nextUnbound;
    }
    controller.state = (controller.state | State.inUnboundQueue) ^ State.inUnboundQueue;
  }

  public process(flags: LifecycleFlags): void {
    while (this.head !== void 0) {
      let cur = this.head;
      this.head = this.tail = void 0;
      let next: IController | undefined;
      do {
        cur.state = (cur.state | State.inUnboundQueue) ^ State.inUnboundQueue;
        cur.unbound(flags);
        next = cur.nextUnbound;
        cur.nextUnbound = void 0;
        cur.prevUnbound = void 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cur = next!; // we're checking it for undefined the next line
      } while (cur !== void 0);
    }
  }
}

export class AttachedQueue implements IAutoProcessingQueue<IController> {
  public readonly lifecycle: ILifecycle;

  public depth: number;

  public head?: IController;
  public tail?: IController;

  public constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;

    this.depth = 0;

    this.head = void 0;
    this.tail = void 0;
  }

  public begin(): void {
    ++this.depth;
  }

  public end(flags?: LifecycleFlags): void {
    if (flags === void 0) {
      flags = LifecycleFlags.none;
    }
    if (--this.depth === 0) {
      // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
      this.lifecycle.mount.process(flags);
      this.process(flags);
    }
  }

  public inline(fn: () => void, flags?: LifecycleFlags): void {
    this.begin();
    fn();
    this.end(flags);
  }

  public add(controller: IController): void {
    if (this.head === void 0) {
      this.head = controller;
    } else {
      controller.prevAttached = this.tail;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tail!.nextAttached = controller; // implied by attachedHead not being undefined
    }
    this.tail = controller;
    controller.state |= State.inAttachedQueue;
  }

  public remove(controller: IController): void {
    if (controller.prevAttached !== void 0) {
      controller.prevAttached.nextAttached = controller.nextAttached;
    }
    if (controller.nextAttached !== void 0) {
      controller.nextAttached.prevAttached = controller.prevAttached;
    }
    controller.prevAttached = void 0;
    controller.nextAttached = void 0;
    if (this.tail === controller) {
      this.tail = controller.prevAttached;
    }
    if (this.head === controller) {
      this.head = controller.nextAttached;
    }
    controller.state = (controller.state | State.inAttachedQueue) ^ State.inAttachedQueue;
  }

  public process(flags: LifecycleFlags): void {
    while (this.head !== void 0) {
      let cur = this.head;
      this.head = this.tail = void 0;
      let next: IController | undefined;
      do {
        cur.state = (cur.state | State.inAttachedQueue) ^ State.inAttachedQueue;
        cur.attached(flags);
        next = cur.nextAttached;
        cur.nextAttached = void 0;
        cur.prevAttached = void 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cur = next!; // we're checking it for undefined the next line
      } while (cur !== void 0);
    }
  }
}

export class DetachedQueue implements IAutoProcessingQueue<IController> {
  public readonly lifecycle: ILifecycle;

  public depth: number;

  public head?: IController;
  public tail?: IController;

  public constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;

    this.depth = 0;

    this.head = void 0;
    this.tail = void 0;
  }

  public begin(): void {
    ++this.depth;
  }

  public end(flags?: LifecycleFlags): void {
    if (flags === void 0) {
      flags = LifecycleFlags.none;
    }
    if (--this.depth === 0) {
      // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
      this.lifecycle.unmount.process(flags);
      this.process(flags);
    }
  }

  public inline(fn: () => void, flags?: LifecycleFlags): void {
    this.begin();
    fn();
    this.end(flags);
  }

  public add(controller: IController): void {
    if (this.head === void 0) {
      this.head = controller;
    } else {
      controller.prevDetached = this.tail;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tail!.nextDetached = controller; // implied by detachedHead not being undefined
    }
    this.tail = controller;
    controller.state |= State.inDetachedQueue;
  }

  public remove(controller: IController): void {
    if (controller.prevDetached !== void 0) {
      controller.prevDetached.nextDetached = controller.nextDetached;
    }
    if (controller.nextDetached !== void 0) {
      controller.nextDetached.prevDetached = controller.prevDetached;
    }
    controller.prevDetached = void 0;
    controller.nextDetached = void 0;
    if (this.tail === controller) {
      this.tail = controller.prevDetached;
    }
    if (this.head === controller) {
      this.head = controller.nextDetached;
    }
    controller.state = (controller.state | State.inDetachedQueue) ^ State.inDetachedQueue;
  }

  public process(flags: LifecycleFlags): void {
    while (this.head !== void 0) {
      let cur = this.head;
      this.head = this.tail = void 0;
      let next: IController | undefined;
      do {
        cur.state = (cur.state | State.inDetachedQueue) ^ State.inDetachedQueue;
        cur.detached(flags);
        next = cur.nextDetached;
        cur.nextDetached = void 0;
        cur.prevDetached = void 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cur = next!; // we're checking it for undefined the next line
      } while (cur !== void 0);
    }
  }
}

export class MountQueue implements IProcessingQueue<IController> {
  public readonly lifecycle: ILifecycle;

  public head?: IController;
  public tail?: IController;

  public constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;

    this.head = void 0;
    this.tail = void 0;
  }

  public add(controller: IController): void {
    if ((controller.state & State.inUnmountQueue) > 0) {
      this.lifecycle.unmount.remove(controller);
      console.log(`in unmount queue during mountQueue.add, so removing`, this);
      return;
    }
    if (this.head === void 0) {
      this.head = controller;
    } else {
      controller.prevMount = this.tail;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tail!.nextMount = controller; // implied by mountHead not being undefined
    }
    this.tail = controller;
    controller.state |= State.inMountQueue;
  }

  public remove(controller: IController): void {
    if (controller.prevMount !== void 0) {
      controller.prevMount.nextMount = controller.nextMount;
    }
    if (controller.nextMount !== void 0) {
      controller.nextMount.prevMount = controller.prevMount;
    }
    controller.prevMount = void 0;
    controller.nextMount = void 0;
    if (this.tail === controller) {
      this.tail = controller.prevMount;
    }
    if (this.head === controller) {
      this.head = controller.nextMount;
    }
    controller.state = (controller.state | State.inMountQueue) ^ State.inMountQueue;
  }

  public process(flags: LifecycleFlags): void {
    let i = 0;
    while (this.head !== void 0) {
      let cur = this.head;
      this.head = this.tail = void 0;
      let next: IController | undefined;
      do {
        cur.state = (cur.state | State.inMountQueue) ^ State.inMountQueue;
        ++i;
        cur.mount(flags);
        next = cur.nextMount;
        cur.nextMount = void 0;
        cur.prevMount = void 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cur = next!; // we're checking it for undefined the next line
      } while (cur !== void 0);
    }
  }
}

export class UnmountQueue implements IProcessingQueue<IController> {
  public readonly lifecycle: ILifecycle;

  public head?: IController;
  public tail?: IController;

  public constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;

    this.head = void 0;
    this.tail = void 0;
  }

  public add(controller: IController): void {
    if ((controller.state & State.inMountQueue) > 0) {
      this.lifecycle.mount.remove(controller);
      return;
    }
    if (this.head === void 0) {
      this.head = controller;
    } else {
      controller.prevUnmount = this.tail;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.tail!.nextUnmount = controller; // implied by unmountHead not being undefined
    }
    this.tail = controller;
    controller.state |= State.inUnmountQueue;
  }

  public remove(controller: IController): void {
    if (controller.prevUnmount !== void 0) {
      controller.prevUnmount.nextUnmount = controller.nextUnmount;
    }
    if (controller.nextUnmount !== void 0) {
      controller.nextUnmount.prevUnmount = controller.prevUnmount;
    }
    controller.prevUnmount = void 0;
    controller.nextUnmount = void 0;
    if (this.tail === controller) {
      this.tail = controller.prevUnmount;
    }
    if (this.head === controller) {
      this.head = controller.nextUnmount;
    }
    controller.state = (controller.state | State.inUnmountQueue) ^ State.inUnmountQueue;
  }

  public process(flags: LifecycleFlags): void {
    let i = 0;
    while (this.head !== void 0) {
      let cur = this.head;
      this.head = this.tail = void 0;
      let next: IController | undefined;
      do {
        cur.state = (cur.state | State.inUnmountQueue) ^ State.inUnmountQueue;
        ++i;
        cur.unmount(flags);
        next = cur.nextUnmount;
        cur.nextUnmount = void 0;
        cur.prevUnmount = void 0;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cur = next!; // we're checking it for undefined the next line
      } while (cur !== void 0);
    }
  }
}

export class BatchQueue implements IAutoProcessingQueue<IBatchable> {
  public readonly lifecycle: ILifecycle;

  public queue: IBatchable[];
  public depth: number;

  public constructor(lifecycle: ILifecycle) {
    this.lifecycle = lifecycle;

    this.queue = [];
    this.depth = 0;
  }

  public begin(): void {
    ++this.depth;
  }

  public end(flags?: LifecycleFlags): void {
    if (flags === void 0) {
      flags = LifecycleFlags.none;
    }
    if (--this.depth === 0) {
      this.process(flags);
    }
  }

  public inline(fn: () => void, flags?: LifecycleFlags): void {
    this.begin();
    fn();
    this.end(flags);
  }

  public add(requestor: IBatchable): void {
    this.queue.push(requestor);
  }

  public remove(requestor: IBatchable): void {
    const index = this.queue.indexOf(requestor);
    if (index > -1) {
      this.queue.splice(index, 1);
    }
  }

  public process(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromBatch;
    while (this.queue.length > 0) {
      const batch = this.queue.slice();
      this.queue = [];
      const { length } = batch;
      for (let i = 0; i < length; ++i) {
        batch[i].flushBatch(flags);
      }
    }
  }
}

export class Lifecycle implements ILifecycle {
  public readonly batch: IAutoProcessingQueue<IBatchable>;

  public readonly mount: IProcessingQueue<IController>;
  public readonly unmount: IProcessingQueue<IController>;

  public readonly bound: IAutoProcessingQueue<IController>;
  public readonly unbound: IAutoProcessingQueue<IController>;

  public readonly attached: IAutoProcessingQueue<IController>;
  public readonly detached: IAutoProcessingQueue<IController>;

  public constructor() {
    this.batch = new BatchQueue(this);

    this.mount = new MountQueue(this);
    this.unmount = new UnmountQueue(this);

    this.bound = new BoundQueue(this);
    this.unbound = new UnboundQueue(this);

    this.attached = new AttachedQueue(this);
    this.detached = new DetachedQueue(this);
  }

  public static register(container: IContainer): IResolver<ILifecycle> {
    return Registration.singleton(ILifecycle, this).register(container);
  }
}
