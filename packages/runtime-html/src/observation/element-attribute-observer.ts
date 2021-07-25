import { LifecycleFlags, subscriberCollection, AccessorType, withFlushQueue } from '@aurelia/runtime';

import type {
  IObserver,
  ISubscriber,
  ISubscriberCollection,
  IFlushable,
  IWithFlushQueue,
  FlushQueue,
} from '@aurelia/runtime';

export interface AttributeObserver extends
  IObserver,
  ISubscriber,
  ISubscriberCollection { }

/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
export class AttributeObserver implements AttributeObserver, ElementMutationSubscriber, IWithFlushQueue, IFlushable {
  // layout is not certain, depends on the attribute being flushed to owner element
  // but for simple start, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  public readonly obj: HTMLElement;
  public value: unknown = null;
  /** @internal */
  private _oldValue: unknown = null;
  /** @internal */
  private _hasChanges: boolean = false;

  public readonly queue!: FlushQueue;
  private f: LifecycleFlags = LifecycleFlags.none;

  public constructor(
    obj: HTMLElement,
    public readonly prop: string,
    public readonly attr: string,
  ) {
    this.obj = obj;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.value;
  }

  public setValue(value: unknown, flags: LifecycleFlags): void {
    this.value = value;
    this._hasChanges = value !== this._oldValue;
    if ((flags & LifecycleFlags.noFlush) === 0) {
      this._flushChanges();
    }
  }

  /** @internal */
  private _flushChanges(): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      const value = this.value;
      const attr = this.attr;
      this._oldValue = value;
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
          this.obj.classList.toggle(this.prop, !!value);
          break;
        }
        case 'style': {
          let priority = '';
          let newValue = value as string;
          if (typeof newValue === 'string' && newValue.includes('!important')) {
            priority = 'important';
            newValue = newValue.replace('!important', '');
          }
          this.obj.style.setProperty(this.prop, newValue, priority);
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
      if (record.type === 'attributes' && record.attributeName === this.prop) {
        shouldProcess = true;
        break;
      }
    }

    if (shouldProcess) {
      let newValue;
      switch (this.attr) {
        case 'class':
          newValue = this.obj.classList.contains(this.prop);
          break;
        case 'style':
          newValue = this.obj.style.getPropertyValue(this.prop);
          break;
        default:
          if (__DEV__)
            throw new Error(`Unsupported observation of attribute: ${this.attr}`);
          else
            throw new Error(`AUR0651:${this.attr}`);
      }

      if (newValue !== this.value) {
        this._oldValue = this.value;
        this.value = newValue;
        this._hasChanges = false;
        this.f = LifecycleFlags.none;
        this.queue.add(this);
      }
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.value = this._oldValue = this.obj.getAttribute(this.prop);
      startObservation(this.obj.ownerDocument.defaultView!.MutationObserver, this.obj as IHtmlElement, this);
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      stopObservation(this.obj as IHtmlElement, this);
    }
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this.value;
    this.subs.notify(this.value, oV, this.f);
  }
}

subscriberCollection(AttributeObserver);
withFlushQueue(AttributeObserver);

interface IHtmlElement extends HTMLElement {
  $mObs: MutationObserver;
  $eMObs: Set<ElementMutationSubscriber>;
}

interface ElementMutationSubscriber {
  handleMutation(mutationRecords: MutationRecord[]): void;
}

const startObservation = ($MutationObserver: typeof MutationObserver, element: IHtmlElement, subscriber: ElementMutationSubscriber): void => {
  if (element.$eMObs === undefined) {
    element.$eMObs = new Set();
  }
  if (element.$mObs === undefined) {
    (element.$mObs = new $MutationObserver(handleMutation)).observe(element, { attributes: true });
  }
  element.$eMObs.add(subscriber);
};

const stopObservation = (element: IHtmlElement, subscriber: ElementMutationSubscriber): boolean => {
  const $eMObservers = element.$eMObs;
  if ($eMObservers && $eMObservers.delete(subscriber)) {
    if ($eMObservers.size === 0) {
      element.$mObs.disconnect();
      element.$mObs = undefined!;
    }
    return true;
  }
  return false;
};

const handleMutation = (mutationRecords: MutationRecord[]): void => {
  (mutationRecords[0].target as IHtmlElement).$eMObs.forEach(invokeHandleMutation, mutationRecords);
};

function invokeHandleMutation(this: MutationRecord[], s: ElementMutationSubscriber): void {
  s.handleMutation(this);
}

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
