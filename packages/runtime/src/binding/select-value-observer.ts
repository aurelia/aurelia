import { ICallable } from '@aurelia/kernel';
import { DOM, INodeObserver } from '../dom';
import { ITaskQueue } from '../task-queue';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { SubscriberCollection } from './subscriber-collection';

const selectArrayContext = 'SelectValueObserver:array';

export class SelectValueObserver extends SubscriberCollection {
  private value: any;
  private oldValue: any;
  private arrayObserver: any;
  private initialSync = false;
  private nodeObserver: INodeObserver;

  constructor(
    private node: HTMLSelectElement,
    public handler: IEventSubscriber,
    private taskQueue: ITaskQueue,
    private observerLocator: IObserverLocator
  ) {
    super();
    this.node = node;
    this.handler = handler;
    this.observerLocator = observerLocator;
  }

  public getValue() {
    return this.value;
  }

  public setValue(newValue: any) {
    if (newValue !== null && newValue !== undefined && this.node.multiple && !Array.isArray(newValue)) {
      throw new Error('Only null or Array instances can be bound to a multi-select.');
    }

    if (this.value === newValue) {
      return;
    }

    // unsubscribe from old array.
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(selectArrayContext, this);
      this.arrayObserver = null;
    }

    // subscribe to new array.
    if (Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribe(selectArrayContext, this);
    }

    // assign and sync element.
    this.oldValue = this.value;
    this.value = newValue;
    this.synchronizeOptions();
    this.notify();
    // queue up an initial sync after the bindings have been evaluated.
    if (!this.initialSync) {
      this.initialSync = true;
      this.taskQueue.queueMicroTask(this);
    }
  }

  public call(context: string, splices: any[]) {
    // called by task queue and array observer.
    this.synchronizeOptions();
  }

  public synchronizeOptions() {
    let value = this.value;
    let isArray: boolean;

    if (Array.isArray(value)) {
      isArray = true;
    }

    let options = this.node.options;
    let i = options.length;
    let matcher = (<any>this.node).matcher || ((a: any, b: any) => a === b);

    while (i--) {
      let option = options.item(i) as HTMLOptionElement & { model?: any };
      let optionValue = option.hasOwnProperty('model') ? option.model : option.value;
      if (isArray) {
        option.selected = value.findIndex((item: any) => !!matcher(optionValue, item)) !== -1; // eslint-disable-line no-loop-func
        continue;
      }
      option.selected = !!matcher(optionValue, value);
    }
  }

  public synchronizeValue() {
    let options = this.node.options;
    let count = 0;
    let value = [];

    for (let i = 0, ii = options.length; i < ii; i++) {
      let option = options.item(i) as HTMLOptionElement & { model?: any };
      if (!option.selected) {
        continue;
      }
      value.push(option.hasOwnProperty('model') ? option.model : option.value);
      count++;
    }

    if (this.node.multiple) {
      // multi-select
      if (Array.isArray(this.value)) {
        let matcher = (<any>this.node).matcher || ((a: any, b: any) => a === b);
        // remove items that are no longer selected.
        let i = 0;
        while (i < this.value.length) {
          let a = this.value[i];
          if (value.findIndex(b => matcher(a, b)) === -1) { // eslint-disable-line no-loop-func
            this.value.splice(i, 1);
          } else {
            i++;
          }
        }
        // add items that have been selected.
        i = 0;
        while (i < value.length) {
          let a = value[i];
          if (this.value.findIndex(b => matcher(a, b)) === -1) { // eslint-disable-line no-loop-func
            this.value.push(a);
          }
          i++;
        }
        return; // don't notify.
      }
    } else {
      // single-select
      if (count === 0) {
        value = null;
      } else {
        value = value[0];
      }
    }

    if (value !== this.value) {
      this.oldValue = this.value;
      this.value = value;
      this.notify();
    }
  }

  public notify() {
    let oldValue = this.oldValue;
    let newValue = this.value;

    this.callSubscribers(newValue, oldValue);
  }

  public handleEvent() {
    this.synchronizeValue();
  }

  public subscribe(context: string, callable: ICallable) {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.node, this);
    }
    this.addSubscriber(context, callable);
  }

  public unsubscribe(context: string, callable: ICallable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  public bind() {
    this.nodeObserver = DOM.createNodeObserver(this.node, () => {
      this.synchronizeOptions();
      this.synchronizeValue();
    }, { childList: true, subtree: true, characterData: true });
  }

  public unbind() {
    this.nodeObserver.disconnect();
    this.nodeObserver = null;

    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(selectArrayContext, this);
      this.arrayObserver = null;
    }
  }
}
