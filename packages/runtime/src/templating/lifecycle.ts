import { BindingFlags } from '../binding/binding-flags';
import { INode } from '../dom';
import { IRenderable } from './renderable';

export class AttachLifecycle {
  private tail = null;
  private head = null;
  private $nextAttached = null;

  private constructor(private owner) {
    this.tail = this.head = this;
  }

  public static start(owner: any, existingLifecycle?: AttachLifecycle): AttachLifecycle {
    return existingLifecycle || new AttachLifecycle(owner);
  }

  public queueAttachedCallback(requestor: IAttach) {
    this.tail.$nextAttached = requestor;
    this.tail = requestor;
  }

  public end(owner: any) {
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
  private viewRemoveHead = null;
  private viewRemoveTail = null;
  private $nextDetached = null;
  private $nextRemoveView = null;
  private $nodes = dummyNodeSequence;

  private constructor(private owner) {
    this.detachedTail = this.detachedHead = this;
    this.viewRemoveTail = this.viewRemoveHead = this;
  }

  public static start(owner: any, existingLifecycle?: DetachLifecycle) {
    return existingLifecycle || new DetachLifecycle(owner);
  }

  public queueViewRemoval(requestor: IRenderable) {
    this.viewRemoveTail.$nextRemoveView = requestor;
    this.viewRemoveTail = requestor;
  }

  public queueDetachedCallback(requestor: IAttach) {
    this.detachedTail.$nextDetached = requestor;
    this.detachedTail = requestor;
  }

  public end(owner: any) {
    if (owner == this.owner) {
      let current = this.detachedHead;
      let next;

      while (current) {
        current.detached();
        next = current.$nextDetached;
        current.$nextDetached = null;
        current = next;
      }

      let current2 = this.viewRemoveHead;
      let next2;

      while (current2) {
        current2.$nodes.remove();
        next2 = current2.$nextRemoveView;
        current2.$nextRemoveView = null;
        current2 = next2;
      }
    }
  }

  private detached() {}
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
