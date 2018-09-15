import { PLATFORM } from '@aurelia/kernel';
import { BindingFlags } from '../binding/binding-flags';
import { INode } from '../dom';
import { IRenderable, isRenderable } from './renderable';

export class AttachLifecycle {
  private tail = null;
  private head = null;
  private $nextAttached = null;

  private constructor(private owner: any) {
    this.tail = this.head = this;
  }

  public static start(owner: any, existingLifecycle?: AttachLifecycle): AttachLifecycle {
    return existingLifecycle || new AttachLifecycle(owner);
  }

  public queueAttachedCallback(requestor: IAttach): void {
    this.tail.$nextAttached = requestor;
    this.tail = requestor;
  }

  public end(owner: any): void {
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

  private attached() {}
}

const dummyNodeSequence = { remove() {} };

export class DetachLifecycle {
  private detachedHead = null; //LOL
  private detachedTail = null;
  private removeNodesHead = null;
  private removeNodesTail = null;
  private $nextDetached = null;
  private $nextRemoveNodes = null;
  private rootRenderable: IRenderable = null;

  private constructor(private owner: any) {
    this.detachedTail = this.detachedHead = this;

    if (isRenderable(owner)) {
      // If the owner is a renderable, then we only need to remove its nodes from
      // the DOM. We don't need any of its children to have their nodes removed,
      // because they will be disconnected from the DOM via their parent.
      this.removeNodesHead = owner;
    } else {
      // If the owner is not a renderable (eg. Repeat), then we need to remove
      // nodes for any root renderables that it invokes the detach lifecycle on.
      this.queueNodeRemoval = queueNodeRemoval;
      this.removeNodesTail = this.removeNodesHead = this;
    }
  }

  public static start(owner: any, existingLifecycle?: DetachLifecycle) {
    return existingLifecycle || new DetachLifecycle(owner);
  }

  public queueNodeRemoval(requestor: IRenderable): void {}

  public queueDetachedCallback(requestor: IAttach): void {
    // While we only sometimes actually remove a requestor's nodes directly,
    // we must always execute the requested lifecycle hooks.
    this.detachedTail.$nextDetached = requestor;
    this.detachedTail = requestor;
  }

  public end(owner: any): void {
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
      this.queueNodeRemoval = queueNodeRemoval;
    }
  }

  private detached() {}
  private $removeNodes() {}
}

function queueNodeRemoval(requestor: IRenderable): void {
  this.removeNodesTail.$nextRemoveNodes = requestor;
  this.removeNodesTail = requestor;

  // If the owner is not a renderable, we still want to be careful not to over
  // remove nodes from the DOM. So, we only queue node removal for root renderables.
  // This is accomplished by disabling queueNodeRemoval until after the root
  // requestor has called "end" on the lifecycle.
  this.queueNodeRemoval = PLATFORM.noop;
  this.rootRenderable = requestor;
}

export interface IAttach {
  readonly $isAttached: boolean;
  $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle): void;
  $detach(lifecycle?: DetachLifecycle): void;
}

export interface IBindSelf {
  readonly $isBound: boolean;
  $bind(flags: BindingFlags): void;
  $unbind(flags: BindingFlags): void;
}
