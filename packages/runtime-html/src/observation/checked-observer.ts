import {
  CollectionKind,
  IBatchedCollectionSubscriber,
  IBindingTargetObserver,
  ICollectionObserver,
  ILifecycle,
  IObserverLocator,
  IPropertySubscriber,
  LifecycleFlags,
  ObserversLookup,
  SetterObserver,
  targetObserver
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

const defaultMatcher = (a: unknown, b: unknown): boolean => {
  return a === b;
};

export interface CheckedObserver extends
  IBindingTargetObserver<IInputElement, string>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver()
export class CheckedObserver implements CheckedObserver {
  public readonly isDOMObserver: true;
  public readonly persistentFlags: LifecycleFlags;
  public currentFlags: LifecycleFlags;
  public currentValue: unknown;
  public defaultValue: unknown;
  public flush: () => void;
  public handler: IEventSubscriber;
  public lifecycle: ILifecycle;
  public obj: IInputElement;
  public observerLocator: IObserverLocator;
  public oldValue: unknown;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private valueObserver: ValueAttributeObserver | SetterObserver;

  constructor(
    flags: LifecycleFlags,
    lifecycle: ILifecycle,
    obj: IInputElement,
    handler: IEventSubscriber,
    observerLocator: IObserverLocator
  ) {
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.isDOMObserver = true;
    this.handler = handler;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.observerLocator = observerLocator;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValueCore(newValue: unknown, flags: LifecycleFlags): void {
    if (!this.valueObserver) {
      this.valueObserver = this.obj['$observers'] && (this.obj['$observers'].model || this.obj['$observers'].value);
      if (this.valueObserver) {
        this.valueObserver.subscribe(this);
      }
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
    if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(this.persistentFlags | flags, newValue);
      this.arrayObserver.subscribeBatched(this);
    }
    this.synchronizeElement();
  }

  // handleBatchedCollectionChange (todo: rename to make this explicit?)
  public handleBatchedChange(): void {
    this.synchronizeElement();
    this.notify(LifecycleFlags.fromFlush);
  }

  // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    this.synchronizeElement();
    this.notify(flags);
  }

  public synchronizeElement(): void {
    const value = this.currentValue;
    const element = this.obj;
    const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    const isRadio = element.type === 'radio';
    const matcher = element['matcher'] || defaultMatcher;

    if (isRadio) {
      element.checked = !!matcher(value, elementValue);
    } else if (value === true) {
      element.checked = true;
    } else if (Array.isArray(value)) {
      element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
    } else {
      element.checked = false;
    }
  }

  public notify(flags: LifecycleFlags): void {
    if (flags & LifecycleFlags.fromBind) {
      return;
    }
    const oldValue = this.oldValue;
    const newValue = this.currentValue;
    if (newValue === oldValue) {
      return;
    }
    this.callSubscribers(this.currentValue, this.oldValue, this.persistentFlags | flags);
  }

  public handleEvent(): void {
    let value = this.currentValue;
    const element = this.obj;
    const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    let index: number;
    const matcher = element['matcher'] || defaultMatcher;

    if (element.type === 'checkbox') {
      if (Array.isArray(value)) {
        index = value.findIndex(item => !!matcher(item, elementValue));
        if (element.checked && index === -1) {
          value.push(elementValue);
        } else if (!element.checked && index !== -1) {
          value.splice(index, 1);
        }
        // when existing value is array, do not invoke callback as only the array element has changed
        return;
      }
      value = element.checked;
    } else if (element.checked) {
      value = elementValue;
    } else {
      return;
    }
    this.oldValue = this.currentValue;
    this.currentValue = value;
    this.notify(LifecycleFlags.fromDOMEvent | LifecycleFlags.allowPublishRoundtrip);
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  public unbind(): void {
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
    if (this.valueObserver) {
      this.valueObserver.unsubscribe(this);
    }
  }
}
