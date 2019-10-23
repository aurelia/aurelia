import {
  CollectionKind,
  IAccessor,
  ICollectionObserver,
  IndexMap,
  IObserverLocator,
  ISubscriber,
  ISubscriberCollection,
  LifecycleFlags,
  ObserversLookup,
  SetterObserver,
  subscriberCollection,
  IScheduler,
  ITask,
} from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
import { ValueAttributeObserver } from './value-attribute-observer';

export interface IInputElement extends HTMLInputElement {
  model?: unknown;
  $observers?: ObserversLookup & {
    model?: SetterObserver;
    value?: ValueAttributeObserver;
  };
  matcher?: typeof defaultMatcher;
}

function defaultMatcher(a: unknown, b: unknown): boolean {
  return a === b;
}

export interface CheckedObserver extends
  ISubscriberCollection {}

@subscriberCollection()
export class CheckedObserver implements IAccessor<unknown> {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public readonly persistentFlags: LifecycleFlags;

  public hasChanges: boolean = false;
  public task: ITask | null = null;

  public arrayObserver?: ICollectionObserver<CollectionKind.array> = void 0;
  public valueObserver?: ValueAttributeObserver | SetterObserver = void 0;

  public constructor(
    public readonly scheduler: IScheduler,
    flags: LifecycleFlags,
    public readonly observerLocator: IObserverLocator,
    public readonly handler: IEventSubscriber,
    public readonly obj: IInputElement,
  ) {
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.fromBind) > 0 || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
      this.flushChanges(flags);
    } else if (this.persistentFlags !== LifecycleFlags.persistentTargetObserverQueue && this.task === null) {
      this.task = this.scheduler.queueRenderTask(() => {
        this.flushChanges(flags);
        this.task = null;
      });
    }
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const { currentValue } = this;
      this.oldValue = currentValue;

      if (this.valueObserver === void 0) {
        if (this.obj.$observers !== void 0) {
          if (this.obj.$observers.model !== void 0) {
            this.valueObserver = this.obj.$observers.model;
          } else if (this.obj.$observers.value !== void 0) {
            this.valueObserver = this.obj.$observers.value;
          }
        }
        if (this.valueObserver !== void 0) {
          this.valueObserver.subscribe(this);
        }
      }

      if (this.arrayObserver !== void 0) {
        this.arrayObserver.unsubscribeFromCollection(this);
        this.arrayObserver = void 0;
      }

      if (this.obj.type === 'checkbox' && Array.isArray(currentValue)) {
        this.arrayObserver = this.observerLocator.getArrayObserver(flags, currentValue);
        this.arrayObserver.subscribeToCollection(this);
      }

      this.synchronizeElement();
    }
  }

  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    const { currentValue, oldValue } = this;
    if ((flags & LifecycleFlags.fromBind) > 0 || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
      this.oldValue = currentValue;
      this.synchronizeElement();
    } else {
      this.hasChanges = true;
    }
    if (this.persistentFlags !== LifecycleFlags.persistentTargetObserverQueue && this.task === null) {
      this.task = this.scheduler.queueRenderTask(() => {
        this.flushChanges(flags);
        this.task = null;
      });
    }
    this.callSubscribers(currentValue, oldValue, flags);
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    if ((flags & LifecycleFlags.fromBind) > 0 || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
      this.synchronizeElement();
    } else {
      this.hasChanges = true;
    }
    if (this.persistentFlags !== LifecycleFlags.persistentTargetObserverQueue && this.task === null) {
      this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags));
    }
    this.callSubscribers(newValue, previousValue, flags);
  }

  public synchronizeElement(): void {
    const { currentValue, obj } = this;
    const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
    const isRadio = obj.type === 'radio';
    const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;

    if (isRadio) {
      obj.checked = !!matcher(currentValue, elementValue);
    } else if (currentValue === true) {
      obj.checked = true;
    } else if (Array.isArray(currentValue)) {
      obj.checked = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
    } else {
      obj.checked = false;
    }
  }

  public handleEvent(): void {
    this.oldValue = this.currentValue;
    let { currentValue } = this;
    const { obj } = this;
    const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
    let index: number;
    const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;

    if (obj.type === 'checkbox') {
      if (Array.isArray(currentValue)) {
        index = currentValue.findIndex(item => !!matcher(item, elementValue));
        if (obj.checked && index === -1) {
          currentValue.push(elementValue);
        } else if (!obj.checked && index !== -1) {
          currentValue.splice(index, 1);
        }
        // when existing currentValue is array, do not invoke callback as only the array obj has changed
        return;
      }
      currentValue = obj.checked;
    } else if (obj.checked) {
      currentValue = elementValue;
    } else {
      return;
    }
    this.currentValue = currentValue;
    this.callSubscribers(this.currentValue, this.oldValue, LifecycleFlags.fromDOMEvent | LifecycleFlags.allowPublishRoundtrip);
  }

  public bind(flags: LifecycleFlags): void {
    if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
      if (this.task !== null) {
        this.task.cancel();
      }
      this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
    }
    this.currentValue = this.obj.checked;
  }

  public unbind(flags: LifecycleFlags): void {
    if (this.arrayObserver !== void 0) {
      this.arrayObserver.unsubscribeFromCollection(this);
      this.arrayObserver = void 0;
    }

    if (this.valueObserver !== void 0) {
      this.valueObserver.unsubscribe(this);
    }

    if (this.task !== null) {
      this.task.cancel();
      this.task = null;
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: ISubscriber): void {
    this.removeSubscriber(subscriber);
    if (!this.hasSubscribers()) {
      this.handler.dispose();
    }
  }
}
