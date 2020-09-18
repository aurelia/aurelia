import {
  DOM,
  IBindingTargetObserver,
  IObserverLocator,
  ISubscriber,
  ISubscriberCollection,
  LifecycleFlags,
  subscriberCollection,
  IScheduler,
  ITask,
  AccessorType,
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
  ISubscriber,
  ISubscriberCollection { }

/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
@subscriberCollection()
export class AttributeObserver implements AttributeObserver, ElementMutationSubscription {
  public currentValue: unknown = null;
  public oldValue: unknown = null;

  public readonly persistentFlags: LifecycleFlags;

  public hasChanges: boolean = false;
  public task: ITask | null = null;
  // layout is not certain, depends on the attribute being flushed to owner element
  // but for simple start, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  public constructor(
    public readonly scheduler: IScheduler,
    flags: LifecycleFlags,
    public readonly observerLocator: IObserverLocator,
    public readonly obj: IHtmlElement,
    public readonly propertyKey: string,
    public readonly targetAttribute: string,
  ) {
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    this.task?.cancel();
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    this.flushChanges(flags);
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const currentValue = this.currentValue;
      this.oldValue = currentValue;
      switch (this.targetAttribute) {
        case 'class': {
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
          if (!!currentValue) {
            this.obj.classList.add(this.propertyKey);
          } else {
            this.obj.classList.remove(this.propertyKey);
          }
          break;
        }
        case 'style': {
          let priority = '';
          let newValue = currentValue as string;
          if (typeof newValue === 'string' && newValue.includes('!important')) {
            priority = 'important';
            newValue = newValue.replace('!important', '');
          }
          this.obj.style.setProperty(this.propertyKey, newValue, priority);
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
          throw new Error(`Unsupported targetAttribute: ${this.targetAttribute}`);
      }

      if (newValue !== this.currentValue) {
        const { currentValue } = this;
        this.currentValue = this.oldValue = newValue;
        this.hasChanges = false;
        this.callSubscribers(newValue, currentValue, LifecycleFlags.fromDOMEvent);
      }
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.hasSubscribers()) {
      this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
      startObservation(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: ISubscriber): void {
    this.removeSubscriber(subscriber);
    if (!this.hasSubscribers()) {
      stopObservation(this.obj, this);
    }
  }
}

const startObservation = (element: IHtmlElement, subscription: ElementMutationSubscription): void => {
  if (element.$eMObservers === undefined) {
    element.$eMObservers = new Set();
  }
  if (element.$mObserver === undefined) {
    element.$mObserver = DOM.createNodeObserver!(
      element,
      handleMutation as (...args: unknown[]) => void,
      { attributes: true }
    ) as MutationObserver;
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
