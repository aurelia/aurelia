import { SubscriberCollection } from './subscriber-collection';
import { ITaskQueue } from '../task-queue';
import { ICallable } from '@aurelia/kernel';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { IAccessor, ISubscribable } from './observation';

const checkedArrayContext = 'CheckedObserver:array';
const checkedValueContext = 'CheckedObserver:value';

export class CheckedObserver extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private value: any;
  private initialSync: boolean;
  private arrayObserver: any;
  private oldValue: any;
  private valueObserver: any;

  constructor(
    private node: HTMLInputElement & { $observers?: any; matcher?: any; model?: any; },
    public handler: IEventSubscriber,
    private taskQueue: ITaskQueue,
    private observerLocator: IObserverLocator
  ) {
    super();
  }

  public getValue() {
    return this.value;
  }

  public setValue(newValue: any) {
    if (this.initialSync && this.value === newValue) {
      return;
    }

    // unsubscribe from old array.
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(checkedArrayContext, this);
      this.arrayObserver = null;
    }

    // subscribe to new array.
    if (this.node.type === 'checkbox' && Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribe(checkedArrayContext, this);
    }

    // assign and sync element.
    this.oldValue = this.value;
    this.value = newValue;
    this.synchronizeElement();
    this.notify();

    // queue up an initial sync after the bindings have been evaluated.
    if (!this.initialSync) {
      this.initialSync = true;
      this.taskQueue.queueMicroTask(this);
    }
  }

  public call(context: string, splices: any[]) {
    // called by task queue, array observer, and model/value observer.
    this.synchronizeElement();
    // if the input's model or value property is data-bound, subscribe to it's
    // changes to enable synchronizing the element's checked status when a change occurs.
    if (!this.valueObserver) {
      this.valueObserver = this.node['$observers'].model || this.node['$observers'].value;
      if (this.valueObserver) {
        this.valueObserver.subscribe(checkedValueContext, this);
      }
    }
  }

  public synchronizeElement() {
    let value = this.value;
    let element = this.node;
    let elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    let isRadio = element.type === 'radio';
    let matcher = element['matcher'] || ((a: any, b: any) => a === b);

    element.checked =
      isRadio && !!matcher(value, elementValue)
      || !isRadio && value === true
      || !isRadio && Array.isArray(value) && value.findIndex(item => !!matcher(item, elementValue)) !== -1;
  }

  public synchronizeValue() {
    let value = this.value;
    let element = this.node;
    let elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    let index;
    let matcher = element['matcher'] || ((a: any, b: any) => a === b);

    if (element.type === 'checkbox') {
      if (Array.isArray(value)) {
        index = value.findIndex(item => !!matcher(item, elementValue));
        if (element.checked && index === -1) {
          value.push(elementValue);
        } else if (!element.checked && index !== -1) {
          value.splice(index, 1);
        }
        // don't invoke callbacks.
        return;
      }

      value = element.checked;
    } else if (element.checked) {
      value = elementValue;
    } else {
      // don't invoke callbacks.
      return;
    }

    this.oldValue = this.value;
    this.value = value;
    this.notify();
  }

  public notify() {
    let oldValue = this.oldValue;
    let newValue = this.value;

    if (newValue === oldValue) {
      return;
    }

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

  public unbind() {
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(checkedArrayContext, this);
      this.arrayObserver = null;
    }
    if (this.valueObserver) {
      this.valueObserver.unsubscribe(checkedValueContext, this);
    }
  }
}
