import { PLATFORM } from '@aurelia/kernel';
import { DOM, IBatchedCollectionSubscriber, IBindingTargetObserver, IPropertySubscriber, LifecycleFlags, targetObserver } from '@aurelia/runtime';

export interface IHtmlElement extends HTMLElement {
  $mObserver: MutationObserver;
  $eMObservers: Set<ElementMutationSubscription>;
}

export interface ElementMutationSubscription {
  handleMutation(mutationRecords: MutationRecord[]): void;
}

export interface InlineStyleObserver extends
  IBindingTargetObserver<IHtmlElement, string>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver('')
export class InlineStyleObserver implements InlineStyleObserver, ElementMutationSubscription {

  // observation related properties
  public currentValue: unknown;
  public currentFlags: LifecycleFlags;
  public oldValue: unknown;
  public defaultValue: unknown;

  // DOM related properties
  public obj: IHtmlElement;
  private cssRule: string;
  private hyphenatedCssRule: string;

  constructor(
    element: Element,
    cssRule: string
  ) {
    this.obj = element as IHtmlElement;
    this.cssRule = cssRule;
    this.hyphenatedCssRule = PLATFORM.kebabCase(cssRule);
  }

  public getValue(): string {
    return this.obj.style.getPropertyValue(this.hyphenatedCssRule);
  }

  public setValueCore(newValue: unknown, flags: LifecycleFlags): void {
    this.obj.style[this.cssRule] = newValue;
  }

  public handleMutation(mutationRecords: MutationRecord[]): void {
    let shouldProcess = false;
    for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
      const record = mutationRecords[i];
      if (record.type === 'attributes' && record.attributeName === 'style') {
        shouldProcess = true;
        break;
      }
    }
    if (shouldProcess) {
      const css = this.obj.style;
      const rule = this.cssRule;
      const newValue = css[rule];
      if (newValue !== this.currentValue) {
        this.currentValue = newValue;
        this.setValue(newValue, LifecycleFlags.none);
      }
    }
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      startObservation(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      stopObservation(this.obj, this);
    }
  }
}

export interface ClassListObserver extends
  IBindingTargetObserver<IHtmlElement, string>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver('')
export class ClassListObserver implements ClassListObserver, ElementMutationSubscription {

  // observation related properties
  public currentValue: unknown;
  public currentFlags: LifecycleFlags;
  public oldValue: unknown;
  public defaultValue: unknown;

  // DOM related properties
  public obj: IHtmlElement;
  private className: string;

  constructor(
    element: Element,
    className: string
  ) {
    this.obj = element as IHtmlElement;
    this.className = className;
  }

  public getValue(): boolean {
    return this.obj.classList.contains(this.className);
  }

  public setValueCore(newValue: unknown, flags: LifecycleFlags): void {
    this.obj.classList[newValue ? 'add' : 'remove'](this.className);
  }

  public handleMutation(mutationRecords: MutationRecord[]): void {
    let shouldProcess = false;
    for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
      const record = mutationRecords[i];
      if (record.type === 'attributes' && record.attributeName === 'class') {
        shouldProcess = true;
        break;
      }
    }
    if (shouldProcess) {
      const newValue = this.obj.classList.contains(this.className);
      if (newValue !== this.currentValue) {
        this.currentValue = newValue;
        this.setValue(newValue, LifecycleFlags.none);
      }
    }
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      startObservation(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      stopObservation(this.obj, this);
    }
  }
}

const startObservation = (element: IHtmlElement, subscription: ElementMutationSubscription): void => {
  if (element.$eMObservers === undefined) {
    element.$eMObservers = new Set();
  }
  if (element.$mObserver === undefined) {
    element.$mObserver = DOM.createNodeObserver(
      element,
      handleMutation,
      { attributes: true }
    ) as MutationObserver;
  }
  element.$eMObservers.add(subscription);
};

const stopObservation = (element: IHtmlElement, subscription: ElementMutationSubscription): boolean => {
  const $eMObservers = element.$eMObservers;
  if ($eMObservers.delete(subscription)) {
    if ($eMObservers.size === 0) {
      element.$mObserver.disconnect();
      element.$mObserver = undefined;
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
