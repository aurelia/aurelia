import { BindingFlags } from '../binding/binding-flags';
import { IChangeSet } from '../binding/change-set';
import { IAccessor, IPropertySubscriber, ISubscribable, ISubscriberCollection, MutationKind } from '../binding/observation';
import { Observer } from '../binding/property-observation';
import { subscriberCollection } from '../binding/subscriber-collection';
import { INode } from '../dom';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { CustomElementResource, ICustomElement, ICustomElementType } from './custom-element';
import { BindableDefinitions } from './instructions';
import { LifecycleHooks } from './lifecycle';

export interface IRuntimeBehavior {
  readonly hooks: LifecycleHooks;
}

/** @internal */
export class RuntimeBehavior implements IRuntimeBehavior {
  public bindables: BindableDefinitions;
  public hooks: LifecycleHooks;

  private constructor() {}

  public static create(Component: ICustomElementType | ICustomAttributeType, instance: ICustomAttribute | ICustomElement): RuntimeBehavior {
    const behavior = new RuntimeBehavior();

    behavior.bindables = Component.description.bindables;
    behavior.hooks = 0;
    if ('created' in instance) behavior.hooks |= LifecycleHooks.hasCreated;
    if ('binding' in instance) behavior.hooks |= LifecycleHooks.hasBinding;
    if ('bound' in instance) behavior.hooks |= LifecycleHooks.hasBound;
    if ('attaching' in instance) behavior.hooks |= LifecycleHooks.hasAttaching;
    if ('attached' in instance) behavior.hooks |= LifecycleHooks.hasAttached;
    if ('detaching' in instance) behavior.hooks |= LifecycleHooks.hasDetaching;
    if ('detached' in instance) behavior.hooks |= LifecycleHooks.hasDetached;
    if ('unbinding' in instance) behavior.hooks |= LifecycleHooks.hasUnbinding;
    if ('unbound' in instance) behavior.hooks |= LifecycleHooks.hasUnbound;
    if ('render' in instance) behavior.hooks |= LifecycleHooks.hasRender;
    if ('caching' in instance) behavior.hooks |= LifecycleHooks.hasCaching;
    if (behavior.hooks === 0) behavior.hooks |= LifecycleHooks.none;

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
      this.customElement.$projector.subscribeToChildrenChange(() => this.onChildrenChanged());
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
