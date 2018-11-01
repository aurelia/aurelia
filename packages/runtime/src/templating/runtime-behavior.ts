import { IIndexable } from '@aurelia/kernel';
import { Observer } from '../binding/property-observation';
import { subscriberCollection } from '../binding/subscriber-collection';
import { BindableDefinitions } from '../definitions';
import { INode } from '../dom';
import { LifecycleHooks, Lifecycle } from '../lifecycle';
import { BindingFlags, IAccessor, IPropertySubscriber, ISubscribable, ISubscriberCollection, MutationKind } from '../observation';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { CustomElementResource, ICustomElement, ICustomElementType } from './custom-element';

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

    // Pre-setting the properties for the lifecycle queues (to null) is to help generate
    // fewer variations in property declaration order and makes it easier for the browser
    // to perform optimizations via generated hidden classes.
    // It also allows us to perform strict null checks which is more efficient than falsey
    // value coercion
    behavior.bindables = Component.description.bindables;
    behavior.hooks = 0;
    if ('created' in instance) behavior.hooks |= LifecycleHooks.hasCreated;
    if ('binding' in instance) behavior.hooks |= LifecycleHooks.hasBinding;
    if ('bound' in instance) {
      behavior.hooks |= LifecycleHooks.hasBound;
      instance['$boundFlags'] = 0;
      instance['$nextBound'] = null;
    }
    if ('attaching' in instance) behavior.hooks |= LifecycleHooks.hasAttaching;
    if ('attached' in instance) {
      behavior.hooks |= LifecycleHooks.hasAttached;
      instance['$nextAttached'] = null;
    }
    if ('detaching' in instance) behavior.hooks |= LifecycleHooks.hasDetaching;
    if ('detached' in instance) {
      behavior.hooks |= LifecycleHooks.hasDetached;
      instance['$nextDetached'] = null;
    }
    if ('unbinding' in instance) behavior.hooks |= LifecycleHooks.hasUnbinding;
    if ('unbound' in instance) {
      behavior.hooks |= LifecycleHooks.hasUnbound;
      instance['$unboundFlags'] = 0;
      instance['$nextUnbound'] = null;
    }
    if ('render' in instance) behavior.hooks |= LifecycleHooks.hasRender;
    if ('caching' in instance) behavior.hooks |= LifecycleHooks.hasCaching;
    if (behavior.hooks === 0) behavior.hooks |= LifecycleHooks.none;
    if ('$mount' in Component.prototype) {
      instance['$nextMount'] = null;
    }

    return behavior;
  }

  public applyTo(instance: ICustomAttribute | ICustomElement): void {
    if ('$projector' in instance) {
      this.applyToElement(instance);
    } else {
      this.applyToCore(instance);
    }
  }

  private applyToElement(instance: ICustomElement): void {
    const observers = this.applyToCore(instance);

    observers.$children = new ChildrenObserver(instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function(): unknown {
        return this.$observers.$children.getValue();
      }
    });
  }

  private applyToCore(instance: (ICustomAttribute | ICustomElement) & { $behavior?: IRuntimeBehavior }): IIndexable {
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

function createGetterSetter(instance: ICustomAttribute | ICustomElement, name: string): void {
  Reflect.defineProperty(instance, name, {
    enumerable: true,
    get: function(): unknown { return this.$observers[name].getValue(); },
    set: function(value: unknown): void { this.$observers[name].setValue(value, BindingFlags.updateTargetInstance); }
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

  constructor(private customElement: ICustomElement & { $childrenChanged?(): void }) { }

  public getValue(): ICustomElement[] {
    if (!this.observing) {
      this.observing = true;
      this.customElement.$projector.subscribeToChildrenChange(() => this.onChildrenChanged());
      this.children = findElements(this.customElement.$projector.children);
    }

    return this.children;
  }

  public setValue(newValue: unknown): void { /* do nothing */ }

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
      this.customElement.$childrenChanged();
    }

    Lifecycle.queueFlush(this);
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
