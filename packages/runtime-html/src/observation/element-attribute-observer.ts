import {
  DOM,
  IBatchedCollectionSubscriber,
  IBindingTargetObserver,
  ILifecycle,
  IObserverLocator,
  IPropertySubscriber,
  LifecycleFlags,
  targetObserver
} from '@aurelia/runtime';

export interface IHtmlElement extends HTMLElement {
  $mObserver: MutationObserver;
  $eMObservers: Set<ElementMutationSubscription>;
}

export interface ElementMutationSubscription {
  handleMutation(mutationRecords: MutationRecord[]): void;
}

export interface AttributeObserver extends
  IBindingTargetObserver<IHtmlElement, string>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver('')
export class AttributeObserver implements AttributeObserver, ElementMutationSubscription {

  // observation related properties
  public readonly isDOMObserver: true;
  public readonly persistentFlags: LifecycleFlags;
  public observerLocator: IObserverLocator;
  public lifecycle: ILifecycle;
  public currentValue: unknown;
  public currentFlags: LifecycleFlags;
  public oldValue: unknown;
  public defaultValue: unknown;

  // DOM related properties
  public obj: IHtmlElement;
  private readonly targetAttribute: string;
  private readonly targetKey: string;

  constructor(
    flags: LifecycleFlags,
    lifecycle: ILifecycle,
    observerLocator: IObserverLocator,
    element: Element,
    targetAttribute: string,
    targetKey: string
  ) {
    this.isDOMObserver = true;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.observerLocator = observerLocator;
    this.lifecycle = lifecycle;
    this.obj = element as IHtmlElement;
    this.targetAttribute = targetAttribute;
    if (targetAttribute === 'class') {
      this.handleMutationCore = this.handleMutationClassName;
      this.setValueCore = this.setValueCoreClassName;
      this.getValue = this.getValueClassName;
    } else if (targetAttribute === 'style') {
      this.handleMutationCore = this.handleMutationInlineStyle;
      this.setValueCore = this.setValueCoreInlineStyle;
      this.getValue = this.getValueInlineStyle;
    }
    this.targetKey = targetKey;
  }

  public getValue(): unknown {
    return this.obj.getAttribute(this.propertyKey);
  }

  public getValueInlineStyle(): string {
    return this.obj.style.getPropertyValue(this.targetKey);
  }
  public getValueClassName(): boolean {
    return this.obj.classList.contains(this.propertyKey);
  }

  public setValueCore(newValue: unknown, flags: LifecycleFlags): void {
    const obj = this.obj;
    const targetAttribute = this.targetAttribute;
    if (newValue === null || newValue === undefined) {
      obj.removeAttribute(targetAttribute);
    } else {
      obj.setAttribute(targetAttribute, newValue as string);
    }
  }
  public setValueCoreInlineStyle(value: unknown): void {
    let priority = '';

    if (typeof value === 'string' && value.indexOf('!important') !== -1) {
      priority = 'important';
      value = value.replace('!important', '');
    }
    this.obj.style.setProperty(this.targetKey, value as string, priority);
  }
  public setValueCoreClassName(newValue: unknown): void {
    const className = this.targetKey;
    const classList = this.obj.classList;
    // Why is class attribute observer setValue look different with class attribute accessor?
    // ==============
    // For class list
    // newValue is simply checked if truthy or falsy
    // and toggle the class accordingly
    // -- the rule of this is quite different to normal attribute
    //
    // for class attribute, observer is different in a way that it only observe a particular class at a time
    // this also comes from syntax, where it would typically be my-class.class="someProperty"
    //
    // so there is no need for separating class by space and add all of them like class accessor
    if (newValue) {
      classList.add(className);
    } else {
      classList.remove(className);
    }
  }

  public handleMutation(mutationRecords: MutationRecord[]): void {
    let shouldProcess = false;
    for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
      const record = mutationRecords[i];
      if (record.type === 'attributes' && record.attributeName === this.targetAttribute) {
        shouldProcess = true;
        break;
      }
    }
    if (shouldProcess) {
      this.handleMutationCore();
    }
  }
  public handleMutationCore(): void {
    const newValue = this.obj.getAttribute(this.targetAttribute);
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      this.setValue(newValue, LifecycleFlags.none);
    }
  }
  public handleMutationInlineStyle(): void {
    const css = this.obj.style;
    const rule = this.targetKey;
    const newValue = css.getPropertyValue(rule);
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      this.setValue(newValue, LifecycleFlags.none);
    }
  }
  public handleMutationClassName(): void {
    const className = this.targetKey;
    const newValue = this.obj.classList.contains(className);
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      this.setValue(newValue, LifecycleFlags.none);
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