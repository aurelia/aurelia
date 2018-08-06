import { ICallable } from '@aurelia/kernel';
import { IAccessor, ISubscribable } from '../binding/observation';
import { Observer } from '../binding/property-observation';
import { SubscriberCollection } from '../binding/subscriber-collection';
import { DOM, INode } from '../dom';
import { ITaskQueue } from '../task-queue';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { BindableDefinitions } from './instructions';

export interface IRuntimeBehavior {
  hasCreated: boolean;
  hasBound: boolean;
  hasAttaching: boolean;
  hasAttached: boolean;
  hasDetaching: boolean;
  hasDetached: boolean;
  hasUnbound: boolean;
  hasCreateView: boolean;
}

/** @internal */
export class RuntimeBehavior implements IRuntimeBehavior {
  private constructor() {}

  public bindables: BindableDefinitions;
  public hasCreated = false;
  public hasBound = false;
  public hasAttaching = false;
  public hasAttached = false;
  public hasDetaching = false;
  public hasDetached = false;
  public hasUnbound = false;
  public hasCreateView = false;

  public static create(instance, bindables: BindableDefinitions, Component: ICustomElementType | ICustomAttributeType) {
    const behavior = new RuntimeBehavior();

    for (let name in instance) {
      if (name in bindables) {
        continue;
      }

      const callback = `${name}Changed`;

      if (callback in instance) {
        bindables[name] = { callback, property: name };
      }
    }

    behavior.bindables = bindables;
    behavior.hasCreated = 'created' in instance;
    behavior.hasBound = 'bound' in instance;
    behavior.hasAttaching = 'attaching' in instance;
    behavior.hasAttached = 'attached' in instance;
    behavior.hasDetaching = 'detaching' in instance;
    behavior.hasDetached = 'detached' in instance;
    behavior.hasUnbound = 'unbound' in instance;
    behavior.hasCreateView = 'createView' in instance;

    return behavior;
  }

  public applyToAttribute(taskQueue: ITaskQueue, instance: ICustomAttribute) {
    this.applyTo(taskQueue, instance);
    return this;
  }

  public applyToElement(taskQueue: ITaskQueue, instance: ICustomElement) {
    const observers = this.applyTo(taskQueue, instance);

    (observers as any).$children = new ChildrenObserver(taskQueue, instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function() {
        return this.$observers.$children.getValue();
      }
    });

    return this;
  }

  private applyTo(taskQueue: ITaskQueue, instance: any) {
    const observers = {};
    const finalBindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(finalBindables);

    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];
      const observable = finalBindables[name];
      const changeHandler = observable.callback;

      if (changeHandler in instance) {
        observers[name] = new Observer(taskQueue, instance[name], v => instance.$isBound ? instance[changeHandler](v) : void 0);
        instance.$changeCallbacks.push(() => instance[changeHandler](instance[name]));
      } else {
        observers[name] = new Observer(taskQueue, instance[name]);
      }

      createGetterSetter(instance, name);
    }

    Reflect.defineProperty(instance, '$observers', {
      enumerable: false,
      value: observers
    });

    instance.$behavior = this;

    return observers;
  }
}

function createGetterSetter(instance, name) {
  Reflect.defineProperty(instance, name, {
    enumerable: true,
    get: function() { return this.$observers[name].getValue(); },
    set: function(value) { this.$observers[name].setValue(value); }
  });
}

/*@internal*/
export class ChildrenObserver extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private children: ICustomElement[] = null;
  private queued = false;
  private observing = false;

  constructor(private taskQueue: ITaskQueue, private customElement: ICustomElement) {
    super();
  }

  public getValue(): ICustomElement[] {
    if (!this.observing) {
      this.observing = true;
      this.customElement.$projector.onChildrenChanged(() => this.onChildrenChanged());
      this.children = findElements(this.customElement.$projector.children);
    }

    return this.children;
  }

  public setValue(newValue) {}

  public call() {
    this.queued = false;
    this.callSubscribers(this.children);
  }

  public subscribe(context: string, callable: ICallable) {
    this.addSubscriber(context, callable);
  }

  public unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }

  private onChildrenChanged(): void {
    this.children = findElements(this.customElement.$projector.children);

    if ('$childrenChanged' in this.customElement) {
      (this.customElement as any).$childrenChanged();
    }

    if (!this.queued) {
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  }
}

/*@internal*/
export function findElements(nodes: ArrayLike<INode>): ICustomElement[] {
  const components: ICustomElement[] = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const current = nodes[i];
    const component = DOM.getCustomElementForNode(current);

    if (component !== null) {
      components.push(component);
    }
  }

  return components;
}
