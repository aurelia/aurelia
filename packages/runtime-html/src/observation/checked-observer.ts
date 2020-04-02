import {
  CollectionKind,
  IAccessor,
  ICollectionObserver,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  LifecycleFlags,
  ObserversLookup,
  SetterObserver,
  subscriberCollection,
  IScheduler,
  ITask,
  getCollectionObserver,
  ILifecycle,
} from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
import { ValueAttributeObserver } from './value-attribute-observer';

type RepeatableCollection = unknown[] | Set<unknown> | Map<unknown, unknown>;

export interface IInputElement extends HTMLInputElement {
  model?: unknown;
  $observers?: ObserversLookup & {
    model?: SetterObserver;
    value?: ValueAttributeObserver;
  };
  matcher?: typeof defaultMatcher;
}

const toStringTag = Object.prototype.toString;

function defaultMatcher(a: unknown, b: unknown): boolean {
  return a === b;
}

export interface CheckedObserver extends
  ISubscriberCollection {}

@subscriberCollection()
export class CheckedObserver implements IAccessor {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public readonly persistentFlags: LifecycleFlags;

  public hasChanges: boolean = false;
  public task: ITask | null = null;

  public collectionObserver?: ICollectionObserver<CollectionKind> = void 0;
  public valueObserver?: ValueAttributeObserver | SetterObserver = void 0;

  public constructor(
    public readonly scheduler: IScheduler,
    flags: LifecycleFlags,
    public lifecycle: ILifecycle,
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
    if ((flags & LifecycleFlags.fromBind) === LifecycleFlags.fromBind || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
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

      const currentValue = this.oldValue = this.currentValue;

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

      if (this.collectionObserver !== void 0) {
        this.collectionObserver.unsubscribeFromCollection(this);
        this.collectionObserver = void 0;
      }

      if (this.obj.type === 'checkbox') {
        this.collectionObserver = getCollectionObserver(flags, this.lifecycle, currentValue as RepeatableCollection);
        if (this.collectionObserver !== void 0) {
          this.collectionObserver.subscribeToCollection(this);
        }
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
    const currentValue = this.currentValue;
    const obj = this.obj;
    const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') as boolean ? obj.model : obj.value;
    const isRadio = obj.type === 'radio';
    const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;

    if (isRadio) {
      obj.checked = !!matcher(currentValue, elementValue);
    } else if (currentValue === true) {
      obj.checked = true;
    } else {
      let hasMatch = false;
      switch (toStringTag.call(currentValue)) {
        case '[object Array]':
          hasMatch = (currentValue as unknown[]).findIndex(item => !!matcher(item, elementValue)) !== -1;
          break;
        case '[object Set]':
          for (const v of currentValue as Set<unknown>) {
            if (matcher(v, elementValue)) {
              hasMatch = true;
              break;
            }
          }
          break;
        case '[object Map]':
          for (const pair of currentValue as Map<unknown, unknown>) {
            const existingItem = pair[0];
            const $isChecked = pair[1];
            // a potential complain, when only `true` is supported
            // but it's consistent with array
            if (matcher(existingItem, elementValue) && $isChecked === true) {
              hasMatch = true;
              break;
            }
          }
      }
      obj.checked = hasMatch;
    }
  }

  public handleEvent(): void {
    let currentValue = this.oldValue = this.currentValue;
    const obj = this.obj;
    const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') as boolean ? obj.model : obj.value;
    const isChecked = obj.checked;
    const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;

    if (obj.type === 'checkbox') {
      const toStringRet = toStringTag.call(currentValue);
      if (toStringRet === '[object Array]') {
        // Array binding steps on a change event:
        // 1. find corresponding item INDEX in the Set based on current model/value and matcher
        // 2. is the checkbox checked?
        //    2.1. Yes: is the corresponding item in the Array (index === -1)?
        //        2.1.1 No: push the current model/value to the Array
        //    2.2. No: is the corresponding item in the Array (index !== -1)?
        //        2.2.1: Yes: remove the corresponding item
        // =================================================
        const index = (currentValue as unknown[]).findIndex(item => !!matcher(item, elementValue));

        // if the checkbox is checkde, and there's no matching value in the existing array
        // add the checkbox model/value to the array
        if (isChecked && index === -1) {
          (currentValue as unknown[]).push(elementValue);
        } else if (!isChecked && index !== -1) {
          // if the checkbox is not checked, and found a matching item in the array
          // based on the checkbox model/value
          // remove the existing item
          (currentValue as unknown[]).splice(index, 1);
        }
        // when existing currentValue is an array,
        // do not invoke callback as only the array obj has changed
        return;
      } else if (toStringRet === '[object Set]') {
        // Set binding steps on a change event:
        // 1. find corresponding item in the Set based on current model/value and matcher
        // 2. is the checkbox checked?
        //    2.1. Yes: is the corresponding item in the Set?
        //        2.1.1 No: add the current model/value to the Set
        //    2.2. No: is the corresponding item in the Set?
        //        2.2.1: Yes: remove the corresponding item
        // =================================================

        // 1. find corresponding item
        const unset = {};
        let existingItem: unknown = unset;
        for (const value of currentValue as Set<unknown>) {
          if (matcher(value, elementValue) === true) {
            existingItem = value;
            break;
          }
        }
        // 2.1. Checkbox is checked, is the corresponding item in the Set?
        //
        // if checkbox is checked and there's no value in the existing Set
        // add the checkbox model/value to the Set
        if (isChecked && existingItem === unset) {
          // 2.1.1. add the current model/value to the Set
          (currentValue as Set<unknown>).add(elementValue);
        } else if (!isChecked && existingItem !== unset) {
          // 2.2.1 Checkbox is unchecked, corresponding is in the Set
          //
          // if checkbox is not checked, and found a matching item in the Set
          // based on the checkbox model/value
          // remove the existing item
          (currentValue as Set<unknown>).delete(existingItem);
        }
        // when existing value is a Set,
        // do not invoke callback as only the Set has been mutated
        return;
      } else if (toStringRet === '[object Map]') {
        // Map binding steps on a change event
        // 1. find corresponding item in the Map based on current model/value and matcher
        // 2. Set the value of the corresponding item in the Map based on checked state of the checkbox
        // =================================================

        // 1. find the corresponding item
        let existingItem: unknown;
        for (const pair of currentValue as Map<unknown, unknown>) {
          const currItem = pair[0];
          if (matcher(currItem, elementValue) === true) {
            existingItem = currItem;
            break;
          }
        }

        // 2. set the value of the corresponding item in the map
        // if checkbox is checked and there's no value in the existing Map
        // add the checkbox model/value to the Map as key,
        // and value will be checked state of the checkbox
        (currentValue as Map<unknown, unknown>).set(existingItem, isChecked);
        // when existing value is a Map,
        // do not invoke callback as only the Map has been mutated
        return;
      }
      currentValue = isChecked;
    } else if (isChecked) {
      currentValue = elementValue;
    } else {
      // if it's a radio and it has been unchecked
      // do nothing, as the radio that was checked will fire change event and it will be handle there
      // a radio cannot be unchecked by user
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unbind(flags: LifecycleFlags): void {
    if (this.collectionObserver !== void 0) {
      this.collectionObserver.unsubscribeFromCollection(this);
      this.collectionObserver = void 0;
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
