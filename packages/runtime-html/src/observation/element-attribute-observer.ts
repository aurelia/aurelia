import { LifecycleFlags, subscriberCollection, AccessorType, withFlushQueue } from '@aurelia/runtime';
import { IPlatform } from '../platform.js';

import type {
  IObserver,
  IObserverLocator,
  ISubscriber,
  ISubscriberCollection,
  IFlushable,
  IWithFlushQueue,
  FlushQueue,
} from '@aurelia/runtime';

export interface IHtmlElement extends HTMLElement {
  $mObserver: MutationObserver;
  $eMObservers: Set<ElementMutationSubscription>;
}

export interface ElementMutationSubscription {
  handleMutation(mutationRecords: MutationRecord[]): void;
}

export interface AttributeObserver extends
  IObserver,
  ISubscriber,
  ISubscriberCollection { }

/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
export class AttributeObserver implements AttributeObserver, ElementMutationSubscription, IWithFlushQueue, IFlushable {
  public value: unknown = null;
  public oldValue: unknown = null;

  public hasChanges: boolean = false;
  // layout is not certain, depends on the attribute being flushed to owner element
  // but for simple start, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  public readonly queue!: FlushQueue;
  private f: LifecycleFlags = LifecycleFlags.none;

  public constructor(
    private readonly platform: IPlatform,
    public readonly observerLocator: IObserverLocator,
    public readonly obj: IHtmlElement,
    public readonly propertyKey: string,
    public readonly targetAttribute: string,
  ) {
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.value;
  }

  public setValue(value: unknown, flags: LifecycleFlags): void {
    this.value = value;
    this.hasChanges = value !== this.oldValue;
    if ((flags & LifecycleFlags.noFlush) === 0) {
      this.flushChanges(flags);
    }
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const value = this.value;
      const attr = this.targetAttribute;
      this.oldValue = value;
      switch (attr) {
        case 'class': {
          // Why does class attribute observer setValue look different with class attribute accessor?
          // ==============
          // For class list
          // newValue is simply checked if truthy or falsy
          // and toggle the class accordingly
          // -- the rule of this is quite different to normal attribute
          //
          // for class attribute, observer is different in a way that it only observes one class at a time
          // this also comes from syntax, where it would typically be my-class.class="someProperty"
          //
          // so there is no need for separating class by space and add all of them like class accessor
          this.obj.classList.toggle(this.propertyKey, !!value);
          break;
        }
        case 'style': {
          let priority = '';
          let newValue = value as string;
          if (typeof newValue === 'string' && newValue.includes('!important')) {
            priority = 'important';
            newValue = newValue.replace('!important', '');
          }
          this.obj.style.setProperty(this.propertyKey, newValue, priority);
          break;
        }
        default: {
          if (value == null) {
            this.obj.removeAttribute(attr);
          } else {
            this.obj.setAttribute(attr, String(value));
          }
        }
      }
    }
  }

  public handleMutation(mutationRecords: MutationRecord[]): void {
    let shouldProcess = false;
    for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
      const record = mutationRecords[i];
      if (record.type === 'attributes' && record.attributeName === this.propertyKey) {
        shouldProcess = true;
        break;
      }
    }

    if (shouldProcess) {
      let newValue;
      switch (this.targetAttribute) {
        case 'class':
          newValue = this.obj.classList.contains(this.propertyKey);
          break;
        case 'style':
          newValue = this.obj.style.getPropertyValue(this.propertyKey);
          break;
        default:
          throw new Error(`Unsupported observation of attribute: ${this.targetAttribute}`);
      }

      if (newValue !== this.value) {
        this.oldValue = this.value;
        this.value = newValue;
        this.hasChanges = false;
        this.f = LifecycleFlags.none;
        this.queue.add(this);
      }
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.value = this.oldValue = this.obj.getAttribute(this.propertyKey);
      startObservation(this.obj.ownerDocument.defaultView!.MutationObserver, this.obj, this);
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      stopObservation(this.obj, this);
    }
  }

  public flush(): void {
    oV = this.oldValue;
    this.oldValue = this.value;
    this.subs.notify(this.value, oV, this.f);
  }
}

subscriberCollection(AttributeObserver);
withFlushQueue(AttributeObserver);

const startObservation = ($MutationObserver: typeof MutationObserver, element: IHtmlElement, subscription: ElementMutationSubscription): void => {
  if (element.$eMObservers === undefined) {
    element.$eMObservers = new Set();
  }
  if (element.$mObserver === undefined) {
    (element.$mObserver = new $MutationObserver(handleMutation)).observe(element, { attributes: true });
  }
  element.$eMObservers.add(subscription);
};

const stopObservation = (element: IHtmlElement, subscription: ElementMutationSubscription): boolean => {
  const $eMObservers = element.$eMObservers;
  if ($eMObservers && $eMObservers.delete(subscription)) {
    if ($eMObservers.size === 0) {
      element.$mObserver.disconnect();
      element.$mObserver = undefined!;
    }
    return true;
  }
  return false;
};

const handleMutation = (mutationRecords: MutationRecord[]): void => {
  (mutationRecords[0].target as IHtmlElement).$eMObservers.forEach(invokeHandleMutation, mutationRecords);
};

function invokeHandleMutation(this: MutationRecord[], s: ElementMutationSubscription): void {
  s.handleMutation(this);
}

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
