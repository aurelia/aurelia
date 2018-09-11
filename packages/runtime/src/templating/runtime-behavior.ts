import { BindingFlags } from '../binding/binding-flags';
import { IChangeSet } from '../binding/change-set';
import { IAccessor, IPropertySubscriber, ISubscribable, ISubscriberCollection, MutationKind } from '../binding/observation';
import { Observer } from '../binding/property-observation';
import { subscriberCollection } from '../binding/subscriber-collection';
import { INode } from '../dom';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import {
  CustomElementResource,
  ICustomElement,
  ICustomElementType
} from './custom-element';
import { BindableDefinitions } from './instructions';

export interface IRuntimeBehavior {
  readonly hasCreated: boolean;
  readonly hasBound: boolean;
  readonly hasAttaching: boolean;
  readonly hasAttached: boolean;
  readonly hasDetaching: boolean;
  readonly hasDetached: boolean;
  readonly hasUnbound: boolean;
  readonly hasRender: boolean;
}

/** @internal */
export class RuntimeBehavior implements IRuntimeBehavior {
  public bindables: BindableDefinitions;

  public hasCreated: boolean = false;
  public hasBound: boolean = false;
  public hasAttaching: boolean = false;
  public hasAttached: boolean = false;
  public hasDetaching: boolean = false;
  public hasDetached: boolean = false;
  public hasUnbound: boolean = false;
  public hasRender: boolean = false;

  private constructor() {}

  public static create(Component: ICustomElementType | ICustomAttributeType, instance: ICustomAttribute | ICustomElement): RuntimeBehavior {
    const behavior = new RuntimeBehavior();

    behavior.bindables = Component.description.bindables;
    behavior.hasCreated = 'created' in instance;
    behavior.hasBound = 'bound' in instance;
    behavior.hasAttaching = 'attaching' in instance;
    behavior.hasAttached = 'attached' in instance;
    behavior.hasDetaching = 'detaching' in instance;
    behavior.hasDetached = 'detached' in instance;
    behavior.hasUnbound = 'unbound' in instance;
    behavior.hasRender = 'render' in instance;

    return behavior;
  }

  public applyTo(instance: ICustomAttribute | ICustomElement, changeSet: IChangeSet): void {
    if ('$projector' in instance) {
      this.applyToElement(changeSet, instance);
    } else {
      this.applyToCore(changeSet, instance);
    }
  }

  private applyToElement(changeSet: IChangeSet, instance: ICustomElement): void {
    const observers = this.applyToCore(changeSet, instance);

    (observers as any).$children = new ChildrenObserver(changeSet, instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function() {
        return this.$observers.$children.getValue();
      }
    });
  }

  private applyToCore(changeSet: IChangeSet, instance: any) {
    const observers = {};
    const bindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);

    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];

      observers[name] = new Observer(
        instance,
        name,
        bindables[name].callback
      );

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

function createGetterSetter(instance: any, name: string): void {
  Reflect.defineProperty(instance, name, {
    enumerable: true,
    get: function() { return this.$observers[name].getValue(); },
    set: function(value) { this.$observers[name].setValue(value, BindingFlags.updateTargetInstance); }
  });
}

export interface IChildrenObserver extends
  IAccessor,
  ISubscribable<MutationKind.instance>,
  ISubscriberCollection<MutationKind.instance> { }

/*@internal*/
@subscriberCollection(MutationKind.instance)
export class ChildrenObserver implements Partial<IChildrenObserver> {
  public hasChanges: boolean = false;

  private children: ICustomElement[] = null;
  private observing: boolean = false;

  constructor(private changeSet: IChangeSet, private customElement: ICustomElement) { }

  public getValue(): ICustomElement[] {
    if (!this.observing) {
      this.observing = true;
      this.customElement.$projector.onChildrenChanged(() => this.onChildrenChanged());
      this.children = findElements(this.customElement.$projector.children);
    }

    return this.children;
  }

  public setValue(newValue: any): void {}

  public flushChanges(this: ChildrenObserver & IChildrenObserver): void {
    this.callSubscribers(this.children, undefined, BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);
    this.hasChanges = false;
  }

  public subscribe(this: ChildrenObserver & IChildrenObserver, subscriber: IPropertySubscriber): void {
    this.addSubscriber(subscriber);
  }

  public unsubscribe(this: ChildrenObserver & IChildrenObserver, subscriber: IPropertySubscriber): void {
    this.removeSubscriber(subscriber);
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
