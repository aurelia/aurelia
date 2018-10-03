import { Immutable, Omit } from '@aurelia/kernel';
import { ICustomElementType, IHydrateElementInstruction, IRenderable, IRenderingEngine, ITemplate } from '.';
import { BindingFlags, IBindScope } from '../binding';
import { INode, INodeSequence } from '../dom';

export enum LifecycleFlags {
  none                = 0b0_001,
  noTasks             = 0b0_010,
  unbindAfterDetached = 0b0_100,
}

export interface IAttach {
  readonly $isAttached: boolean;
  $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
  $detach(lifecycle: IDetachLifecycle): void;
  $cache(): void;
}

export interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
}

/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends Partial<Omit<IRenderable, '$addNodes' | '$removeNodes'>> {
  /**
   * Only applies to `@customElement`. This hook is not invoked for `@customAttribute`s
   *
   * Called during `$hydrate`, after `this.$scope` and `this.$projector` are set.
   *
   * If this hook is implemented, it will be used instead of `renderingEngine.getElementTemplate`.
   * This allows you to completely override the default rendering behavior.
   *
   * In addition to providing the return value, it is the responsibility of the implementer to:
   * - Populate `this.$bindables` with any Bindings, child Views, custom elements and custom attributes
   * - Populate `this.$attachables` with any child Views, custom elements and custom attributes
   *
   * @param host The DOM node that declares this custom element
   * @param parts Replaceable parts, if any
   *
   * @returns Either an instance of `INodeSequence` with the nodes that need to be appended to the host,
   * or an implementation of `IElementTemplateProvider`
   *
   * @description
   * This is the first "hydrate" lifecycle hook. It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   */
  render?(host: INode, parts: Immutable<Pick<IHydrateElementInstruction, 'parts'>>): IElementTemplateProvider | INodeSequence;

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
   * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `ChangeSet` which is now being flushed
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
   * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `ChangeSet` which is now being flushed
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
   * Called during `$removeNodes` (which happens during `$detach`), specifically after the
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

type LifecycleNodeAddable = Pick<IRenderable, '$addNodes'> & {
  /*@internal*/
  $nextAddNodes?: LifecycleNodeAddable;
};

export interface IAttachLifecycle {
  readonly flags: LifecycleFlags;
  registerTask(task: ILifecycleTask): void;
  createChild(): IAttachLifecycle;
  queueAddNodes(requestor: LifecycleNodeAddable): void;
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

type LifecycleNodeRemovable = Pick<IRenderable, '$removeNodes'> & {
  /*@internal*/
  $nextRemoveNodes?: LifecycleNodeRemovable;
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
  queueRemoveNodes(requestor: LifecycleNodeRemovable): void;
  queueDetachedCallback(requestor: LifecycleDetachable): void;
}

/*@internal*/
export class AttachLifecycleController implements IAttachLifecycle, IAttachLifecycleController {
  /*@internal*/
  public $nextAddNodes: LifecycleNodeAddable;
  /*@internal*/
  public $nextAttached: LifecycleAttachable;

  private attachedHead: LifecycleAttachable;
  private attachedTail: LifecycleAttachable;
  private addNodesHead: LifecycleNodeAddable;
  private addNodesTail: LifecycleNodeAddable;
  private task: AggregateLifecycleTask = null;

  constructor(
    public readonly flags: LifecycleFlags,
    private parent: AttachLifecycleController = null,
    private encapsulationSource: INode = null
  ) {
    this.addNodesTail = this.addNodesHead = this;
    this.attachedTail = this.attachedHead = this;
  }

  public attach(requestor: IAttach): IAttachLifecycleController {
    requestor.$attach(this.encapsulationSource, this);
    return this;
  }

  public queueAddNodes(requestor: LifecycleNodeAddable): void {
    this.addNodesTail.$nextAddNodes = requestor;
    this.addNodesTail = requestor;
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
    const lifecycle = new AttachLifecycleController(this.flags, this);
    this.queueAddNodes(lifecycle);
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
    this.processAddNodes();
    this.processAttachedCallbacks();
  }

  /*@internal*/
  public $addNodes(): void {
    if (this.parent !== null) {
      this.processAddNodes();
    }
  }

  /*@internal*/
  public attached(): void {
    if (this.parent !== null) {
      this.processAttachedCallbacks();
    }
  }

  private processAddNodes(): void {
    let currentAddNodes = this.addNodesHead;
    let nextAddNodes;

    while (currentAddNodes) {
      currentAddNodes.$addNodes();
      nextAddNodes = currentAddNodes.$nextAddNodes;
      currentAddNodes.$nextAddNodes = null;
      currentAddNodes = nextAddNodes;
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
  public $nextRemoveNodes: LifecycleNodeRemovable;
  /*@internal*/
  public $nextDetached: LifecycleDetachable;

  private detachedHead: LifecycleDetachable; //LOL
  private detachedTail: LifecycleDetachable;
  private removeNodesHead: LifecycleNodeRemovable;
  private removeNodesTail: LifecycleNodeRemovable;
  private task: AggregateLifecycleTask = null;
  private allowNodeRemoves: boolean = true;

  constructor(
    public readonly flags: LifecycleFlags,
    private parent: DetachLifecycleController = null
  ) {
    this.detachedTail = this.detachedHead = this;
    this.removeNodesTail = this.removeNodesHead = this;
  }

  public detach(requestor: IAttach): IDetachLifecycleController {
    this.allowNodeRemoves = true;

    if (requestor.$isAttached) {
      requestor.$detach(this);
    } else if (isNodeRemovable(requestor)) {
      this.queueRemoveNodes(requestor);
    }

    return this;
  }

  public queueRemoveNodes(requestor: LifecycleNodeRemovable): void {
    if (this.allowNodeRemoves) {
      this.removeNodesTail.$nextRemoveNodes = requestor;
      this.removeNodesTail = requestor;
      this.allowNodeRemoves = false; // only remove roots
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
    const lifecycle = new DetachLifecycleController(this.flags, this);
    this.queueRemoveNodes(lifecycle);
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
  public $removeNodes(): void {
    if (this.parent !== null) {
      this.processRemoveNodes();
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
    this.processRemoveNodes();
    this.processDetachedCallbacks();
  }

  private processRemoveNodes(): void {
    let currentRemoveNodes = this.removeNodesHead;

    if (this.flags & LifecycleFlags.unbindAfterDetached) {
      while (currentRemoveNodes) {
        currentRemoveNodes.$removeNodes();
        currentRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
      }
    } else {
      let nextRemoveNodes;

      while (currentRemoveNodes) {
        currentRemoveNodes.$removeNodes();
        nextRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
        currentRemoveNodes.$nextRemoveNodes = null;
        currentRemoveNodes = nextRemoveNodes;
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
      let currentRemoveNodes = this.removeNodesHead;
      let nextRemoveNodes;

      while (currentRemoveNodes) {
        if (isUnbindable(currentRemoveNodes)) {
          currentRemoveNodes.$unbind(BindingFlags.fromUnbind);
        }

        nextRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
        currentRemoveNodes.$nextRemoveNodes = null;
        currentRemoveNodes = nextRemoveNodes;
      }
    }
  }
}

function isNodeRemovable(requestor: object): requestor is LifecycleNodeRemovable {
  return '$removeNodes' in requestor;
}

function isUnbindable(requestor: object): requestor is IBindScope {
  return '$unbind' in requestor;
}

export const Lifecycle = {
  beginAttach(encapsulationSource: INode, flags: LifecycleFlags): IAttachLifecycleController {
    return new AttachLifecycleController(flags, null, encapsulationSource);
  },

  beginDetach(flags: LifecycleFlags): IDetachLifecycleController {
    return new DetachLifecycleController(flags);
  },

  done: {
    done: true,
    canCancel(): boolean { return false; },
    // tslint:disable-next-line:no-empty
    cancel(): void {},
    wait(): Promise<void> { return Promise.resolve(); }
  }
};
