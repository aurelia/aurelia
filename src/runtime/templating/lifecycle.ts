import { IViewOwner } from "./view";

export class AttachAssistant {
  private tail = null;
  private head = null;
  private $nextAttached = null;
  
  private constructor(private manager) {
    this.tail = this.head = this;
  }

  private attached() {}

  isManagedBy(requestor) {
    return this.manager === requestor;
  }

  queueForAttachedCallback(requestor: IAttach) {
    this.tail.$nextAttached = requestor;
    this.tail = requestor;
  }

  fire() {
    let current = this.head;
    let next;

    while (current) {
      current.attached();
      next = current.$nextAttached;
      current.$nextAttached = null;
      current = next;
    }
  }

  static hire(manager) {
    return new AttachAssistant(manager);
  }
}

export class DetachAssistant {
  private detachedHead = null; //LOL
  private detachedTail = null;
  private viewRemoveHead = null;
  private viewRemoveTail = null;
  private $nextDetached = null;
  private $nextRemoveView = null;
  private $view = { remove() {} }
  
  private constructor(private manager) {
    this.detachedTail = this.detachedHead = this;
    this.viewRemoveTail = this.viewRemoveHead = this;
  }

  isManagedBy(requestor) {
    return this.manager === requestor;
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

  fire() {
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

  static hire(manager) {
    return new DetachAssistant(manager);
  }
}

export interface IAttach {
  attach(assistant?: AttachAssistant): void;
  detach(assistant?: DetachAssistant): void;
}

export interface IBindSelf {
  bind(): void;
  unbind(): void;
}
