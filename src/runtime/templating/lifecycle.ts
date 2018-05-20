import { IViewOwner } from './view';

export class AttachContext {
  private tail = null;
  private head = null;
  private $nextAttached = null;
  
  private constructor(private opener) {
    this.tail = this.head = this;
  }

  private attached() {}

  wasOpenedBy(requestor) {
    return this.opener === requestor;
  }

  queueForAttachedCallback(requestor: IAttach) {
    this.tail.$nextAttached = requestor;
    this.tail = requestor;
  }

  close() {
    let current = this.head;
    let next;

    while (current) {
      current.attached();
      next = current.$nextAttached;
      current.$nextAttached = null;
      current = next;
    }
  }

  static open(manager) {
    return new AttachContext(manager);
  }
}

const dummyView = { remove() {} };

export class DetachContext {
  private detachedHead = null; //LOL
  private detachedTail = null;
  private viewRemoveHead = null;
  private viewRemoveTail = null;
  private $nextDetached = null;
  private $nextRemoveView = null;
  private $view = dummyView;
  
  private constructor(private opener) {
    this.detachedTail = this.detachedHead = this;
    this.viewRemoveTail = this.viewRemoveHead = this;
  }

  wasOpenedBy(requestor) {
    return this.opener === requestor;
  }

  private detached() {}

  queueForViewRemoval(requestor: IViewOwner) {
    this.viewRemoveTail.$nextRemoveView = requestor;
    this.viewRemoveTail = requestor;
  }

  queueForDetachedCallback(requestor: IAttach) {
    this.detachedTail.$nextDetached = requestor;
    this.detachedTail = requestor;
  }

  close() {
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
      current2.$view.remove();
      next2 = current2.$nextRemoveView;
      current2.$nextRemoveView = null;
      current2 = next2;
    }
  }

  static open(manager) {
    return new DetachContext(manager);
  }
}

export interface IAttach {
  $attach(context?: AttachContext): void;
  $detach(context?: DetachContext): void;
}

export interface IBindSelf {
  $bind(): void;
  $unbind(): void;
}
