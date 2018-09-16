import { PLATFORM } from '@aurelia/kernel';
import { INode } from '../dom';
import { IRenderable, isRenderable } from './renderable';

type LifecycleAttachable = {
  /*@internal*/
  $nextAttached?: LifecycleAttachable;
  attached(): void;
};

export interface IAttach {
  readonly $isAttached: boolean;
  $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle): void;
  $detach(lifecycle?: DetachLifecycle): void;
}

export class AttachLifecycle {
  /*@internal*/
  public $nextAttached: LifecycleAttachable;
  /*@internal*/
  public attached: typeof PLATFORM.noop = PLATFORM.noop;

  private tail: LifecycleAttachable;
  private head: LifecycleAttachable;

  private constructor(private owner: unknown) {
    this.tail = this.head = this;
  }

  public static start(owner: unknown, existingLifecycle?: AttachLifecycle): AttachLifecycle {
    return existingLifecycle || new AttachLifecycle(owner);
  }

  public queueAttachedCallback(requestor: LifecycleAttachable): void {
    this.tail.$nextAttached = requestor;
    this.tail = requestor;
  }

  public end(owner: unknown): void {
    if (owner === this.owner) {
      let current = this.head;
      let next;

      while (current) {
        current.attached();
        next = current.$nextAttached;
        current.$nextAttached = null;
        current = next;
      }
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

export class DetachLifecycle {
  /*@internal*/
  public $nextDetached: LifecycleDetachable;
  /*@internal*/
  public $nextRemoveNodes: LifecycleNodeRemovable;
  /*@internal*/
  public detached: typeof PLATFORM.noop = PLATFORM.noop;
  /*@internal*/
  public $removeNodes: typeof PLATFORM.noop = PLATFORM.noop;

  public queueNodeRemoval: (requestor: LifecycleNodeRemovable) => void
    = PLATFORM.noop;

  private detachedHead: LifecycleDetachable; //LOL
  private detachedTail: LifecycleDetachable;
  private removeNodesHead: LifecycleNodeRemovable;
  private removeNodesTail: LifecycleNodeRemovable;
  private rootRenderable: LifecycleNodeRemovable;

  private constructor(private owner: unknown) {
    this.detachedTail = this.detachedHead = this;

    if (isRenderable(owner)) {
      // If the owner is a renderable, then we only need to remove its nodes from
      // the DOM. We don't need any of its children to have their nodes removed,
      // because they will be disconnected from the DOM via their parent.
      this.removeNodesHead = owner;
    } else {
      // If the owner is not a renderable (eg. Repeat), then we need to remove
      // nodes for any root renderables that it invokes the detach lifecycle on.
      this.queueNodeRemoval = this.queueNodeRemovalForRoot;
      this.removeNodesTail = this.removeNodesHead = this;
    }
  }

  public static start(owner: unknown, existingLifecycle?: DetachLifecycle): DetachLifecycle {
    return existingLifecycle || new DetachLifecycle(owner);
  }

  public queueDetachedCallback(requestor: LifecycleDetachable): void {
    // While we only sometimes actually remove a requestor's nodes directly,
    // we must always execute the requested lifecycle hooks.
    this.detachedTail.$nextDetached = requestor;
    this.detachedTail = requestor;
  }

  public end(owner: unknown): void {
    if (owner === this.owner) {
      let currentRemoveNodes = this.removeNodesHead;
      let nextRemoveNodes;

      while (currentRemoveNodes) {
        currentRemoveNodes.$removeNodes();
        nextRemoveNodes = currentRemoveNodes.$nextRemoveNodes;
        currentRemoveNodes.$nextRemoveNodes = null;
        currentRemoveNodes = nextRemoveNodes;
      }

      let currentDetached = this.detachedHead;
      let nextDetached;

      while (currentDetached) {
        currentDetached.detached();
        nextDetached = currentDetached.$nextDetached;
        currentDetached.$nextDetached = null;
        currentDetached = nextDetached;
      }
    } else if (owner === this.rootRenderable) {
      // The root renderable has called "end" on the lifecycle, so we put back
      // the ability to queue node removal for the next top-level renderable.
      this.queueNodeRemoval = this.queueNodeRemovalForRoot;
    }
  }

  private queueNodeRemovalForRoot(requestor: LifecycleNodeRemovable): void {
    this.removeNodesTail.$nextRemoveNodes = requestor;
    this.removeNodesTail = requestor;

    // If the owner is not a renderable, we still want to be careful not to over
    // remove nodes from the DOM. So, we only queue node removal for root renderables.
    // This is accomplished by disabling queueNodeRemoval until after the root
    // requestor has called "end" on the lifecycle.
    this.queueNodeRemoval = PLATFORM.noop;
    this.rootRenderable = requestor;
  }
}
