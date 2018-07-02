import { IElementComponent, IAttributeComponent, IElementType, IAttributeType } from "./component";
import { ICallable } from "../../kernel/interfaces";
import { DOM, INode, IChildObserver } from "../dom";
import { ITaskQueue } from "../task-queue";
import { SubscriberCollection } from "../binding/subscriber-collection";
import { IAccessor, ISubscribable } from "../binding/observation";
import { Observer } from "../binding/property-observation";
import { BindableDefinitions } from "./instructions";

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

  bindables: BindableDefinitions;
  hasCreated = false;
  hasBound = false;
  hasAttaching = false;
  hasAttached = false;
  hasDetaching = false;
  hasDetached = false;
  hasUnbound = false;
  hasCreateView = false;

  static create(instance, bindables: BindableDefinitions, Component: IElementType | IAttributeType) {
    const behavior = new RuntimeBehavior();

    for (let name in instance) {
      if (name in bindables) {
        continue;
      }

      const callback = `${name}Changed`;

      if (callback in instance) {
        bindables[name] = { callback };
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

  applyToAttribute(taskQueue: ITaskQueue, instance: IAttributeComponent) {
    this.applyTo(taskQueue, instance);
    return this;
  }

  applyToElement(taskQueue: ITaskQueue, instance: IElementComponent) {
    const observers = this.applyTo(taskQueue, instance);

    (<any>observers).$children = new ChildrenObserver(taskQueue, instance);

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

class ChildrenObserver extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private observer: IChildObserver = null;
  private children: IElementComponent[] = null;
  private queued = false;

  constructor(private taskQueue: ITaskQueue, private component: IElementComponent) {
    super();
  }

  getValue(): IElementComponent[] {
    if (this.observer === null) {
      this.observer = DOM.createChildObserver(this.component.$host, () => this.onChildrenChanged());
      this.children = findElements(this.observer.childNodes);
    }

    return this.children;
  }

  setValue(newValue) {}

  private onChildrenChanged() {
    this.children = findElements(this.observer.childNodes);

    if ('$childrenChanged' in this.component) {
      (<any>this.component).$childrenChanged();
    }

    if (!this.queued) {
      this.queued = true;
      this.taskQueue.queueMicroTask(this);
    }
  }

  call() {
    this.queued = false;
    this.callSubscribers(this.children);
  }

  subscribe(context: string, callable: ICallable) {
    this.addSubscriber(context, callable);
  }

  unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }
}

function findElements(nodes: ArrayLike<INode>): IElementComponent[] {
  const components: IElementComponent[] = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const current = nodes[i];
    const component = DOM.getComponentForNode(current);
    
    if (component !== null) {
      components.push(component);
    }
  }

  return components;
}
