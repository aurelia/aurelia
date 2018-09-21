import { PLATFORM } from '@aurelia/kernel';
import { INode } from '../dom';
import { IRenderable, isRenderable } from './renderable';

export enum LifecycleFlags {
  none                  = 0b0_001,
  skipAnimation         = 0b0_010,
  unbindAfterDetached   = 0b0_100,
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

export interface IAttach {
  readonly $isAttached: boolean;
  $attach(encapsulationSource: INode, lifecycle?: IAttachLifecycle): void;
  $detach(lifecycle?: IDetachLifecycle): void;
}

export interface IAttachLifecycle {
  readonly flags: LifecycleFlags;
  registerTask(task: Promise<unknown>): void;
  createChild(): IAttachLifecycle;
  queueAddNodes(requestor: LifecycleNodeAddable): void;
  queueAttachedCallback(requestor: LifecycleAttachable): void;
  end(owner: unknown): Promise<boolean> | boolean;
}

export class AttachLifecycle implements IAttachLifecycle {
  /*@internal*/
  public $nextAddNodes: LifecycleNodeAddable;
  /*@internal*/
  public $nextAttached: LifecycleAttachable;

  private attachedHead: LifecycleAttachable;
  private attachedTail: LifecycleAttachable;
  private addNodesHead: LifecycleNodeAddable;
  private addNodesTail: LifecycleNodeAddable;
  private tasks: Promise<unknown>[] = null;

  private constructor(
    private owner: unknown,
    private isChild: boolean,
    public readonly flags: LifecycleFlags
  ) {
    this.addNodesTail = this.addNodesHead = this;
    this.attachedTail = this.attachedHead = this;
  }

  public static start(
    owner: unknown,
    existingLifecycle?: IAttachLifecycle,
    flags?: LifecycleFlags
  ): IAttachLifecycle {
    return existingLifecycle
      || new AttachLifecycle(owner, false, flags || LifecycleFlags.none);
  }

  public queueAddNodes(requestor: LifecycleNodeAddable): void {
    this.addNodesTail.$nextAddNodes = requestor;
    this.addNodesTail = requestor;
  }

  public queueAttachedCallback(requestor: LifecycleAttachable): void {
    this.attachedTail.$nextAttached = requestor;
    this.attachedTail = requestor;
  }

  public registerTask(task: Promise<unknown>): void {
    if (this.isChild) {
      (this.owner as IAttachLifecycle).registerTask(task);
    } else {
      let tasks = this.tasks;

      if (tasks === null) {
        this.tasks = tasks = [];
      }

      tasks.push(task);
    }
  }

  public createChild(): IAttachLifecycle {
    const lifecycle = new AttachLifecycle(this, true, this.flags);
    this.queueAddNodes(lifecycle);
    this.queueAttachedCallback(lifecycle);
    return lifecycle;
  }

  public end(owner: unknown): Promise<boolean> | boolean {
    if (owner === this.owner) {
      if (this.tasks !== null) {
        const tasks = PLATFORM.toArray(this.tasks);
        this.tasks = null;
        return Promise.all(tasks).then(() => this.end(owner));
      }

      this.processAddNodes();
      this.processAttachedCallbacks();

      return true;
    }

    return false;
  }

  /*@internal*/
  public $addNodes(): void {
    if (this.isChild) {
      this.processAddNodes();
    }
  }

  /*@internal*/
  public attached(): void {
    if (this.isChild) {
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

type LifecycleDetachable = {
  /*@internal*/
  $nextDetached?: LifecycleDetachable;
  detached(): void;
};

type LifecycleNodeRemovable = Pick<IRenderable, '$removeNodes'> & {
  /*@internal*/
  $nextRemoveNodes?: LifecycleNodeRemovable;
};

export interface IDetachLifecycle {
  readonly flags: LifecycleFlags;
  registerTask(task: Promise<unknown>): void;
  createChild(): IDetachLifecycle;
  queueRemoveNodes(requestor: LifecycleNodeRemovable): void;
  queueDetachedCallback(requestor: LifecycleDetachable): void;
  end(owner: unknown): Promise<boolean> | boolean;
}

export class DetachLifecycle implements IDetachLifecycle {
  /*@internal*/
  public $nextRemoveNodes: LifecycleNodeRemovable;
  /*@internal*/
  public $nextDetached: LifecycleDetachable;

  public queueRemoveNodes: (requestor: LifecycleNodeRemovable) => void
    = PLATFORM.noop;

  private detachedHead: LifecycleDetachable; //LOL
  private detachedTail: LifecycleDetachable;
  private removeNodesHead: LifecycleNodeRemovable;
  private removeNodesTail: LifecycleNodeRemovable;
  private rootRenderable: LifecycleNodeRemovable;
  private tasks: Promise<unknown>[] = null;

  private constructor(
    private owner: unknown,
    private isChild: boolean,
    public readonly flags: LifecycleFlags
  ) {
    this.detachedTail = this.detachedHead = this;

    if (isRenderable(owner)) {
      // If the owner is a renderable, then we only need to remove its nodes from
      // the DOM. We don't need any of its children to have their nodes removed,
      // because they will be disconnected from the DOM via their parent.
      this.removeNodesHead = owner;
    } else {
      // If the owner is not a renderable (eg. Repeat), then we need to remove
      // nodes for any root renderables that it invokes the detach lifecycle on.
      this.queueRemoveNodes = this.queueNodeRemovalForRoot;
      this.removeNodesTail = this.removeNodesHead = this;
    }
  }

  public static start(
    owner: unknown,
    existingLifecycle?: IDetachLifecycle,
    flags?: LifecycleFlags
  ): IDetachLifecycle {
    return existingLifecycle
      || new DetachLifecycle(owner, false, flags || LifecycleFlags.none);
  }

  public queueDetachedCallback(requestor: LifecycleDetachable): void {
    // While we only sometimes actually remove a requestor's nodes directly,
    // we must always execute the requested lifecycle hooks.
    this.detachedTail.$nextDetached = requestor;
    this.detachedTail = requestor;
  }

  public registerTask(task: Promise<unknown>): void {
    if (this.isChild) {
      (this.owner as IDetachLifecycle).registerTask(task);
    } else {
      let tasks = this.tasks;

      if (tasks === null) {
        this.tasks = tasks = [];
      }

      tasks.push(task);
    }
  }

  public createChild(): IDetachLifecycle {
    const lifecycle = new DetachLifecycle(this, true, this.flags);
    this.queueRemoveNodes(lifecycle);
    this.queueDetachedCallback(lifecycle);
    return lifecycle;
  }

  public end(owner: unknown): Promise<boolean> | boolean {
    if (owner === this.owner) {
      if (this.tasks !== null) {
        const tasks = PLATFORM.toArray(this.tasks);
        this.tasks = null;
        return Promise.all(tasks).then(() => this.end(owner));
      }

      this.processRemoveNodes();
      this.processDetachedCallbacks();

      return true;
    } else if (owner === this.rootRenderable) {
      // The root renderable has called "end" on the lifecycle, so we put back
      // the ability to queue node removal for the next top-level renderable.
      this.queueRemoveNodes = this.queueNodeRemovalForRoot;
    }

    return false;
  }

  /*@internal*/
  public $removeNodes(): void {
    if (this.isChild) {
      this.processRemoveNodes();
    }
  }

  /*@internal*/
  public detached(): void {
    if (this.isChild) {
      this.processDetachedCallbacks();
    }
  }

  private processRemoveNodes(): void {
    let currentRemoveNodes = this.removeNodesHead;
    let nextRemoveNodes;

    while (currentRemoveNodes) {
      currentRemoveNodes.$removeNodes();
      nextRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
      currentRemoveNodes.$nextRemoveNodes = null;
      currentRemoveNodes = nextRemoveNodes;
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
  }

  private queueNodeRemovalForRoot(requestor: LifecycleNodeRemovable): void {
    this.removeNodesTail.$nextRemoveNodes = requestor;
    this.removeNodesTail = requestor;

    // If the owner is not a renderable, we still want to be careful not to over
    // remove nodes from the DOM. So, we only queue node removal for root renderables.
    // This is accomplished by disabling queueNodeRemoval until after the root
    // requestor has called "end" on the lifecycle.
    this.queueRemoveNodes = PLATFORM.noop;
    this.rootRenderable = requestor;
  }
}
