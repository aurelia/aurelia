import { subscriberCollection, AccessorType } from '@aurelia/runtime';
import { createError, isString } from '../utilities';

import type {
  IObserver,
  ISubscriber,
  ISubscriberCollection,
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
export class AttributeObserver implements AttributeObserver, ElementMutationSubscriber {
  // layout is not certain, depends on the attribute being flushed to owner element
  // but for simple start, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  /** @internal */
  private readonly _obj: HTMLElement;

  /** @internal */
  private _value: unknown = null;

  /** @internal */
  private _oldValue: unknown = null;

  /** @internal */
  private _hasChanges: boolean = false;

  /** @internal */
  private readonly _prop: string;

  /** @internal */
  private readonly _attr: string;

  public constructor(
    obj: HTMLElement,
    // todo: rename to attr and sub-attr
    prop: string,
    attr: string,
  ) {
    this._obj = obj;
    this._prop = prop;
    this._attr = attr;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this._value;
  }

  public setValue(value: unknown): void {
    this._value = value;
    this._hasChanges = value !== this._oldValue;
    this._flushChanges();
  }

  /** @internal */
  private _flushChanges(): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      this._oldValue = this._value;
      switch (this._attr) {
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
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          this._obj.classList.toggle(this._prop, !!this._value);
          break;
        }
        case 'style': {
          let priority = '';
          let newValue = this._value as string;
          if (isString(newValue) && newValue.includes('!important')) {
            priority = 'important';
            newValue = newValue.replace('!important', '');
          }
          this._obj.style.setProperty(this._prop, newValue, priority);
          break;
        }
        default: {
          if (this._value == null) {
            this._obj.removeAttribute(this._attr);
          } else {
            this._obj.setAttribute(this._attr, String(this._value));
          }
        }
      }
    }
  }

  public handleMutation(mutationRecords: MutationRecord[]): void {
    let shouldProcess = false;
    for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
      const record = mutationRecords[i];
      if (record.type === 'attributes' && record.attributeName === this._prop) {
        shouldProcess = true;
        break;
      }
    }

    if (shouldProcess) {
      let newValue;
      switch (this._attr) {
        case 'class':
          newValue = this._obj.classList.contains(this._prop);
          break;
        case 'style':
          newValue = this._obj.style.getPropertyValue(this._prop);
          break;
        default:
          if (__DEV__)
            throw createError(`AUR0651: Unsupported observation of attribute: ${this._attr}`);
          else
            throw createError(`AUR0651:${this._attr}`);
      }

      if (newValue !== this._value) {
        this._oldValue = this._value;
        this._value = newValue;
        this._hasChanges = false;
        this._flush();
      }
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this._value = this._oldValue = this._obj.getAttribute(this._prop);
      startObservation(this._obj.ownerDocument.defaultView!.MutationObserver, this._obj as IHtmlElement, this);
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      stopObservation(this._obj as IHtmlElement, this);
    }
  }

  /** @internal */
  private _flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV);
  }
}

subscriberCollection(AttributeObserver);

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
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/strict-boolean-expressions
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
