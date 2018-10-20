import { Immutable } from '@aurelia/kernel';
import { ICustomElementType, IHydrateElementInstruction, IRenderable, IRenderingEngine, ITemplate } from '.';
import { BindingFlags, IBindScope, IChangeSet } from '../binding';
import { INode } from '../dom';
import { ILifecycleState } from '../lifecycle-state';

export enum LifecycleFlags {
  none                = 0b001,
  noTasks             = 0b010,
  unbindAfterDetached = 0b100,
}

export const enum LifecycleHooks {
  none                   = 0b000000000001,
  hasCreated             = 0b000000000010,
  hasBinding             = 0b000000000100,
  hasBound               = 0b000000001000,
  hasAttaching           = 0b000000010000,
  hasAttached            = 0b000000100000,
  hasDetaching           = 0b000001000000,
  hasDetached            = 0b000010000000,
  hasUnbinding           = 0b000100000000,
  hasUnbound             = 0b001000000000,
  hasRender              = 0b010000000000,
  hasCaching             = 0b100000000000
}

export interface IAttach extends ICachable {
  readonly $isAttached: boolean;
  $nextAttachable: IAttach;
  $prevAttachable: IAttach;
  $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
  $detach(lifecycle: IDetachLifecycle): void;
}

export interface ICachable extends ILifecycleState {
  readonly $isCached: boolean;
  $cache(): void;
}

export interface IMountable extends ILifecycleState {
  readonly $needsMount: boolean;
  /**
   * Add the `$nodes` of this instance to the Host or RenderLocation that this instance is holding.
   */
  $mount(): void;

  /**
   * Remove the `$nodes` of this instance from the Host or RenderLocation that this instance is holding, optionally returning them to a cache.
   * @returns
   * - `true` if the instance has been returned to the cache.
   * - `false` if the cache (typically ViewFactory) did not allow the instance to be cached.
   * - `undefined` (void) if the instance does not support caching. Functionally equivalent to `false`
   */
  $unmount(): boolean | void;
}

export interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
}

/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends Partial<IRenderable> {
  /**
   * Only applies to `@customElement`. This hook is not invoked for `@customAttribute`s
   *
   * Called during `$hydrate`, after `this.$scope` and `this.$projector` are set.
   *
   * If this hook is implemented, it will be used instead of `renderingEngine.getElementTemplate`.
   * This allows you to completely override the default rendering behavior.
   *
   * It is the responsibility of the implementer to:
   * - Populate `this.$bindables` with any Bindings, child Views, custom elements and custom attributes
   * - Populate `this.$attachables` with any child Views, custom elements and custom attributes
   * - Populate `this.$nodes` with the nodes that need to be appended to the host
   * - Populate `this.$context` with the RenderContext / Container scoped to this instance
   *
   * @param host The DOM node that declares this custom element
   * @param parts Replaceable parts, if any
   *
   * @returns Either an implementation of `IElementTemplateProvider`, or void
   *
   * @description
   * This is the first "hydrate" lifecycle hook. It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   */
  render?(host: INode, parts: Immutable<Pick<IHydrateElementInstruction, 'parts'>>): IElementTemplateProvider | void;

  /**
   * Called at the end of `$hydrate`.
   *
   * The following key properties are now assigned and initialized (see `IRenderable` for more detail):
   * - `this.$bindables`
   * - `this.$attachables`
   * - `this.$scope` (null if this is a custom attribute, or contains the view model if this is a custom element)
   * - `this.$nodes`
   *
   * @description
   * This is the second and last "hydrate" lifecycle hook (after `render`). It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   *
   * This hook is called right before the `$bind` lifecycle starts, making this the last opportunity
   * for any high-level post processing on initialized properties.
   */
  created?(): void;

  /**
   * Called at the start of `$bind`, before this instance and its children (if any) are bound.
   *
   * - `this.$isBound` is false.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & BindingFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & BindingFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & BindingFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
   * and the third lifecycle hook (after `render` and `created`) of the very first lifecycle.
   */
  binding?(flags: BindingFlags): void;

  /**
   * Called at the end of `$bind`, after this instance and its children (if any) are bound.
   *
   * - `$isBound` is true.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & BindingFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & BindingFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & BindingFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
   * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first lifecycle.
   */
  bound?(flags: BindingFlags): void;

  /**
   * Called at the start of `$attach`, before this instance and its children (if any) are attached.
   *
   * `$isAttached` is false.
   *
   * @param encapsulationSource Ask Rob.
   * @param lifecycle Utility that encapsulates the attach sequence for a hierarchy of attachables and guarantees the correct attach order.
   *
   * @description
   * This is the third "create" lifecycle hook (after `binding` and `bound`) of the hooks that can occur multiple times per instance,
   * and the fifth lifecycle hook (after `render`, `created`, `binding` and `bound`) of the very first lifecycle
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are added to the DOM.
   */
  attaching?(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;

  /**
   * Called at the end of `$attach`, after this instance and its children (if any) are attached.
   *
   * - `$isAttached` is true.
   *
   * @description
   * This is the fourth (and last) "create" lifecycle hook (after `binding`, `bound` and `attaching`) of the hooks that can occur
   * multiple times per instance, and the sixth lifecycle hook (after `render`, `created`, `binding`, `bound` and `attaching`)
   * of the very first lifecycle
   *
   * This instance and its children (if any) can be assumed
   * to be fully initialized, bound, rendered, added to the DOM and ready for use.
   */
  attached?(): void;

  /**
   * Called at the start of `$detach`, before this instance and its children (if any) are detached.
   *
   * - `$isAttached` is true.
   *
   * @param lifecycle Utility that encapsulates the detach sequence for a hierarchy of attachables and guarantees the correct detach order.
   *
   * @description
   * This is the first "cleanup" lifecycle hook.
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are removed from the DOM.
   */
  detaching?(lifecycle: IDetachLifecycle): void;

  /**
   * Called during `$unmount` (which happens during `$detach`), specifically after the
   * `$nodes` are removed from the DOM, but before the view is actually added to the cache.
   *
   * @description
   * This is the second "cleanup" lifecycle hook.
   *
   * This lifecycle is invoked if and only if the `ViewFactory` that created the `View` allows the view to be cached.
   *
   * Usually this hook is not invoked unless you explicitly set the cache size to to something greater than zero
   * on the resource description.
   */
  caching?(): void;

  /**
   * Called at the end of `$detach`, after this instance and its children (if any) are detached.
   *
   * - `$isAttached` is false.
   *
   * @description
   * This is the third "cleanup" lifecycle hook (after `detaching` and `caching`).
   *
   * The `$nodes` are now removed from the DOM and the `View` (if possible) is returned to cache.
   *
   * If no `$unbind` lifecycle is queued, this is the last opportunity to make state changes before the lifecycle ends.
   */
  detached?(): void;

  /**
   * Called at the start of `$unbind`, before this instance and its children (if any) are unbound.
   *
   * - `this.$isBound` is true.
   * - `this.$scope` is still available.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & BindingFlags.fromBind`: the component is just switching scope
   * - `flags & BindingFlags.fromUnbind`: the component is really disposing
   * - `flags & BindingFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fourth "cleanup" lifecycle hook (after `detaching`, `caching` and `detached`)
   *
   * Last opportunity to perform any source or target updates before the bindings are disconnected.
   *
   */
  unbinding?(flags: BindingFlags): void;

  /**
   * Called at the end of `$unbind`, after this instance and its children (if any) are unbound.
   *
   * - `this.$isBound` is false at this point.
   *
   * - `this.$scope` may not be available anymore (unless it's a `@customElement`)
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & BindingFlags.fromBind`: the component is just switching scope
   * - `flags & BindingFlags.fromUnbind`: the component is really disposing
   * - `flags & BindingFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fifth (and last) "cleanup" lifecycle hook (after `detaching`, `caching`, `detached`
   * and `unbinding`).
   *
   * The lifecycle either ends here, or starts at `$bind` again.
   */
  unbound?(flags: BindingFlags): void;
}

export interface ILifecycleTask {
  readonly done: boolean;
  canCancel(): boolean;
  cancel(): void;
  wait(): Promise<void>;
}

export interface IAttachLifecycleController {
  attach(requestor: IAttach): IAttachLifecycleController;
  end(): ILifecycleTask;
}

type LifecycleAttachable = {
  /*@internal*/
  $nextAttached?: LifecycleAttachable;
  attached(): void;
};

type LifecycleMountable = Pick<IMountable, '$mount'> & {
  /*@internal*/
  $nextMount?: LifecycleMountable;
};

export interface IAttachLifecycle {
  readonly flags: LifecycleFlags;
  registerTask(task: ILifecycleTask): void;
  createChild(): IAttachLifecycle;
  queueMount(requestor: LifecycleMountable): void;
  queueAttachedCallback(requestor: LifecycleAttachable): void;
}

export interface IDetachLifecycleController {
  detach(requestor: IAttach): IDetachLifecycleController;
  end(): ILifecycleTask;
}

type LifecycleDetachable = {
  /*@internal*/
  $nextDetached?: LifecycleDetachable;
  detached(): void;
};

type LifecycleUnmountable = Pick<IMountable, '$unmount'> & {
  /*@internal*/
  $nextUnmount?: LifecycleUnmountable;
};

export class AggregateLifecycleTask implements ILifecycleTask {
  public done: boolean = true;

  /*@internal*/
  public owner: AttachLifecycleController | DetachLifecycleController = null;

  private tasks: ILifecycleTask[] = [];
  private waiter: Promise<void> = null;
  private resolve: () => void = null;

  public addTask(task: ILifecycleTask): void {
    if (!task.done) {
      this.done = false;
      this.tasks.push(task);
      task.wait().then(() => this.tryComplete());
    }
  }

  public canCancel(): boolean {
    if (this.done) {
      return false;
    }

    return this.tasks.every(x => x.canCancel());
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.tasks.forEach(x => x.cancel());
      this.done = false;
    }
  }

  public wait(): Promise<void> {
    if (this.waiter === null) {
      if (this.done) {
        this.waiter = Promise.resolve();
      } else {
        // tslint:disable-next-line:promise-must-complete
        this.waiter = new Promise((resolve) => this.resolve = resolve);
      }
    }

    return this.waiter;
  }

  private tryComplete(): void {
    if (this.done) {
      return;
    }

    if (this.tasks.every(x => x.done)) {
      this.complete(true);
    }
  }

  private complete(notCancelled: boolean): void {
    this.done = true;

    if (notCancelled && this.owner !== null) {
      this.owner.processAll();
    }

    if (this.resolve !== null) {
      this.resolve();
    }
  }
}

export interface IDetachLifecycle {
  readonly flags: LifecycleFlags;
  registerTask(task: ILifecycleTask): void;
  createChild(): IDetachLifecycle;
  queueUnmount(requestor: LifecycleUnmountable): void;
  queueDetachedCallback(requestor: LifecycleDetachable): void;
}

/*@internal*/
export class AttachLifecycleController implements IAttachLifecycle, IAttachLifecycleController {
  /*@internal*/
  public $nextMount: LifecycleMountable = null;
  /*@internal*/
  public $nextAttached: LifecycleAttachable = null;

  private attachedHead: LifecycleAttachable = this;
  private attachedTail: LifecycleAttachable = this;
  private mountHead: LifecycleMountable = this;
  private mountTail: LifecycleMountable = this;
  private task: AggregateLifecycleTask = null;

  constructor(
    public readonly changeSet: IChangeSet,
    public readonly flags: LifecycleFlags,
    private parent: AttachLifecycleController = null,
    private encapsulationSource: INode = null
  ) { }

  public attach(requestor: IAttach): IAttachLifecycleController {
    requestor.$attach(this.encapsulationSource, this);
    return this;
  }

  public queueMount(requestor: LifecycleMountable): void {
    this.mountTail.$nextMount = requestor;
    this.mountTail = requestor;
  }

  public queueAttachedCallback(requestor: LifecycleAttachable): void {
    this.attachedTail.$nextAttached = requestor;
    this.attachedTail = requestor;
  }

  public registerTask(task: ILifecycleTask): void {
    if (this.parent !== null) {
      this.parent.registerTask(task);
    } else {
      if (this.task === null) {
        this.task = new AggregateLifecycleTask();
      }
      this.task.addTask(task);
    }
  }

  public createChild(): IAttachLifecycle {
    const lifecycle = new AttachLifecycleController(this.changeSet, this.flags, this);
    this.queueMount(lifecycle);
    this.queueAttachedCallback(lifecycle);
    return lifecycle;
  }

  public end(): ILifecycleTask {
    if (this.task !== null && !this.task.done) {
      this.task.owner = this;
      return this.task;
    }

    this.processAll();

    return Lifecycle.done;
  }

  /*@internal*/
  public processAll(): void {
    this.changeSet.flushChanges();
    this.processMounts();
    this.processAttachedCallbacks();
  }

  /*@internal*/
  public $mount(): void {
    if (this.parent !== null) {
      this.processMounts();
    }
  }

  /*@internal*/
  public attached(): void {
    if (this.parent !== null) {
      this.processAttachedCallbacks();
    }
  }

  private processMounts(): void {
    let currentMount = this.mountHead;
    let nextMount;

    while (currentMount) {
      currentMount.$mount();
      nextMount = currentMount.$nextMount;
      currentMount.$nextMount = null;
      currentMount = nextMount;
    }
  }

  private processAttachedCallbacks(): void {
    let currentAttached = this.attachedHead;
    let nextAttached;

    while (currentAttached) {
      currentAttached.attached();
      nextAttached = currentAttached.$nextAttached;
      currentAttached.$nextAttached = null;
      currentAttached = nextAttached;
    }
  }
}

/*@internal*/
export class DetachLifecycleController implements IDetachLifecycle, IDetachLifecycleController {
  /*@internal*/
  public $nextUnmount: LifecycleUnmountable = null;
  /*@internal*/
  public $nextDetached: LifecycleDetachable = null;

  private detachedHead: LifecycleDetachable = this; //LOL
  private detachedTail: LifecycleDetachable = this;
  private unmountHead: LifecycleUnmountable = this;
  private unmountTail: LifecycleUnmountable = this;
  private task: AggregateLifecycleTask = null;
  private allowUnmount: boolean = true;

  constructor(
    public readonly changeSet: IChangeSet,
    public readonly flags: LifecycleFlags,
    private parent: DetachLifecycleController = null
  ) { }

  public detach(requestor: IAttach): IDetachLifecycleController {
    this.allowUnmount = true;

    if (requestor.$isAttached) {
      requestor.$detach(this);
    } else if (isUnmountable(requestor)) {
      this.queueUnmount(requestor);
    }

    return this;
  }

  public queueUnmount(requestor: LifecycleUnmountable): void {
    if (this.allowUnmount) {
      this.unmountTail.$nextUnmount = requestor;
      this.unmountTail = requestor;
      // Note: this comment is just a temporary measure while we get some complex integration tests to work first.
      // Just to reduce the amount of potential things to track down and check if something fails.
      // When everything is working and tested, we can add this optimization (and others) back in.
      //this.allowNodeRemoves = false; // only remove roots
    }
  }

  public queueDetachedCallback(requestor: LifecycleDetachable): void {
    this.detachedTail.$nextDetached = requestor;
    this.detachedTail = requestor;
  }

  public registerTask(task: ILifecycleTask): void {
    if (this.parent !== null) {
      this.parent.registerTask(task);
    } else {
      if (this.task === null) {
        this.task = new AggregateLifecycleTask();
      }
      this.task.addTask(task);
    }
  }

  public createChild(): IDetachLifecycle {
    const lifecycle = new DetachLifecycleController(this.changeSet, this.flags, this);
    this.queueUnmount(lifecycle);
    this.queueDetachedCallback(lifecycle);
    return lifecycle;
  }

  public end(): ILifecycleTask {
    if (this.task !== null && !this.task.done) {
      this.task.owner = this;
      return this.task;
    }

    this.processAll();

    return Lifecycle.done;
  }

  /*@internal*/
  public $unmount(): void {
    if (this.parent !== null) {
      this.processUnmounts();
    }
  }

  /*@internal*/
  public detached(): void {
    if (this.parent !== null) {
      this.processDetachedCallbacks();
    }
  }

  /*@internal*/
  public processAll(): void {
    this.changeSet.flushChanges();
    this.processUnmounts();
    this.processDetachedCallbacks();
  }

  private processUnmounts(): void {
    let currentUnmount = this.unmountHead;

    if (this.flags & LifecycleFlags.unbindAfterDetached) {
      while (currentUnmount) {
        currentUnmount.$unmount();
        currentUnmount = currentUnmount.$nextUnmount;
      }
    } else {
      let nextUnmount;

      while (currentUnmount) {
        currentUnmount.$unmount();
        nextUnmount = currentUnmount.$nextUnmount;
        currentUnmount.$nextUnmount = null;
        currentUnmount = nextUnmount;
      }
    }
  }

  private processDetachedCallbacks(): void {
    let currentDetached = this.detachedHead;
    let nextDetached;

    while (currentDetached) {
      currentDetached.detached();
      nextDetached = currentDetached.$nextDetached;
      currentDetached.$nextDetached = null;
      currentDetached = nextDetached;
    }

    if (this.flags & LifecycleFlags.unbindAfterDetached) {
      let currentUnmount = this.unmountHead;
      let nextUnmount;

      while (currentUnmount) {
        if (isUnbindable(currentUnmount)) {
          currentUnmount.$unbind(BindingFlags.fromUnbind);
        }

        nextUnmount = currentUnmount.$nextUnmount;
        currentUnmount.$nextUnmount = null;
        currentUnmount = nextUnmount;
      }
    }
  }
}

function isUnmountable(requestor: object): requestor is LifecycleUnmountable {
  return '$unmount' in requestor;
}

function isUnbindable(requestor: object): requestor is IBindScope {
  return '$unbind' in requestor;
}

export const Lifecycle = {
  beginAttach(changeSet: IChangeSet, encapsulationSource: INode, flags: LifecycleFlags): IAttachLifecycleController {
    return new AttachLifecycleController(changeSet, flags, null, encapsulationSource);
  },

  beginDetach(changeSet: IChangeSet, flags: LifecycleFlags): IDetachLifecycleController {
    return new DetachLifecycleController(changeSet, flags);
  },

  done: {
    done: true,
    canCancel(): boolean { return false; },
    // tslint:disable-next-line:no-empty
    cancel(): void {},
    wait(): Promise<void> { return Promise.resolve(); }
  }
};
