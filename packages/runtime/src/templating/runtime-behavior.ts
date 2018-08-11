import { ICallable } from '@aurelia/kernel';
import { IChangeSet } from '../binding/change-set';
import { IAccessor, ISubscribable, MutationKind, IPropertySubscriber } from '../binding/observation';
import { Observer } from '../binding/property-observation';
import { SubscriberCollection } from '../binding/subscriber-collection';
import { INode } from '../dom';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import {
  CustomElementResource,
  ICustomElement,
  ICustomElementType
} from './custom-element';
import { BindableDefinitions } from './instructions';
import { BindingFlags } from '../binding/binding-flags';

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
  public bindables: BindableDefinitions;
  public hasCreated = false;
  public hasBound = false;
  public hasAttaching = false;
  public hasAttached = false;
  public hasDetaching = false;
  public hasDetached = false;
  public hasUnbound = false;
  public hasCreateView = false;

  private constructor() {}

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

  public applyToAttribute(changeSet: IChangeSet, instance: ICustomAttribute) {
    this.applyTo(changeSet, instance);
    return this;
  }

  public applyToElement(changeSet: IChangeSet, instance: ICustomElement) {
    const observers = this.applyTo(changeSet, instance);

    (observers as any).$children = new ChildrenObserver(changeSet, instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function() {
        return this.$observers.$children.getValue();
      }
    });

    return this;
  }

  private applyTo(changeSet: IChangeSet, instance: any) {
    const observers = {};
    const finalBindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(finalBindables);

    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];
      const observable = finalBindables[name];
      const changeHandler = observable.callback;

      if (changeHandler in instance) {
        observers[name] = new Observer(changeSet, instance[name], v => instance.$isBound ? instance[changeHandler](v) : void 0);
        instance.$changeCallbacks.push(() => instance[changeHandler](instance[name]));
      } else {
        observers[name] = new Observer(changeSet, instance[name]);
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
export class ChildrenObserver extends SubscriberCollection implements IAccessor, ISubscribable<MutationKind.instance> {
  private children: ICustomElement[] = null;
  private observing = false;
  public hasChanges = false;

  constructor(private changeSet: IChangeSet, private customElement: ICustomElement) {
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

  public flushChanges() {
    this.callSubscribers(this.children);
    this.hasChanges = false;
  }

  public subscribe(subscriber: IPropertySubscriber, flags?: BindingFlags) {
    this.addSubscriber(subscriber, flags);
  }

  public unsubscribe(subscriber: IPropertySubscriber, flags?: BindingFlags) {
    this.removeSubscriber(subscriber, flags);
  }

  private onChildrenChanged(): void {
    this.children = findElements(this.customElement.$projector.children);

    if ('$childrenChanged' in this.customElement) {
      (this.customElement as any).$childrenChanged();
    }

    this.changeSet.add(this);
    this.hasChanges = true;
  }
}

const elementBehaviorFor = CustomElementResource.behaviorFor;

/*@internal*/
export function findElements(nodes: ArrayLike<INode>): ICustomElement[] {
  const components: ICustomElement[] = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const current = nodes[i];
    const component = elementBehaviorFor(current);

    if (component !== null) {
      components.push(component);
    }
  }

  return components;
}
