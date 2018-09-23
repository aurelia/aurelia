import { PLATFORM } from '@aurelia/kernel';
import { BindingFlags, IBindScope } from '../binding';
import { INode } from '../dom';
import { IRenderable, isRenderable } from './renderable';

export enum LifecycleFlags {
  none                  = 0b0_001,
  skipAnimation         = 0b0_010,
  unbindAfterDetached   = 0b0_100,
}

export interface IAttach {
  readonly $isAttached: boolean;
  $attach(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
  $detach(lifecycle: IDetachLifecycle): void;
  $cache(): void;
}

export interface IAttachLifecycleController {
  attach(requestor: IAttach): IAttachLifecycleController;
  end(): Promise<unknown> | void;
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
  registerTask(task: Promise<unknown>): void;
  createChild(): IAttachLifecycle;
  queueAddNodes(requestor: LifecycleNodeAddable): void;
  queueAttachedCallback(requestor: LifecycleAttachable): void;
}

export interface IDetachLifecycleController {
  detach(requestor: IAttach): IDetachLifecycleController;
  end(): Promise<unknown> | void;
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
}

/*@internal*/
class AttachLifecycleController implements IAttachLifecycle, IAttachLifecycleController {
  /*@internal*/
  public $nextAddNodes: LifecycleNodeAddable;
  /*@internal*/
  public $nextAttached: LifecycleAttachable;

  private attachedHead: LifecycleAttachable;
  private attachedTail: LifecycleAttachable;
  private addNodesHead: LifecycleNodeAddable;
  private addNodesTail: LifecycleNodeAddable;
  private tasks: Promise<unknown>[] = null;

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

  public registerTask(task: Promise<unknown>): void {
    if (this.parent !== null) {
      this.parent.registerTask(task);
    } else {
      let tasks = this.tasks;

      if (tasks === null) {
        this.tasks = tasks = [];
      }

      tasks.push(task);
    }
  }

  public createChild(): IAttachLifecycle {
    const lifecycle = new AttachLifecycleController(this.flags, this);
    this.queueAddNodes(lifecycle);
    this.queueAttachedCallback(lifecycle);
    return lifecycle;
  }

  public end(): Promise<unknown> | void {
    if (this.tasks !== null) {
      const tasks = PLATFORM.toArray(this.tasks);
      this.tasks = null;
      return Promise.all(tasks).then(() => this.end());
    }

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
  private tasks: Promise<unknown>[] = null;
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

  public registerTask(task: Promise<unknown>): void {
    if (this.parent !== null) {
      this.parent.registerTask(task);
    } else {
      let tasks = this.tasks;

      if (tasks === null) {
        this.tasks = tasks = [];
      }

      tasks.push(task);
    }
  }

  public createChild(): IDetachLifecycle {
    const lifecycle = new DetachLifecycleController(this.flags, this);
    this.queueRemoveNodes(lifecycle);
    this.queueDetachedCallback(lifecycle);
    return lifecycle;
  }

  public end(): Promise<unknown> | void {
    if (this.tasks !== null) {
      const tasks = PLATFORM.toArray(this.tasks);
      this.tasks = null;
      return Promise.all(tasks).then(() => this.end());
    }

    this.processRemoveNodes();
    this.processDetachedCallbacks();
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
  }
};
