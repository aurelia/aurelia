import { IContainer, DI, inject } from '../di';
import { ITemplate, ViewEngine, IVisualFactory } from './view-engine';
import { ITemplateSource, IBindableInstruction } from './instructions';
import { IElementType, IAttributeType, IAttributeComponent, IElementComponent } from './component';
import { ITaskQueue } from '../task-queue';
import { Observer } from '../binding/property-observation';
import { IChildObserver, DOM, INode } from '../dom';
import { SubscriberCollection } from '../binding/subscriber-collection';
import { IAccessor, ISubscribable } from '../binding/observation';
import { ICallable } from '../interfaces';

export interface ITemplateEngine {
  getElementTemplate(source: ITemplateSource, componentType: IElementType): ITemplate;
  getVisualFactory(container: IContainer, source: ITemplateSource): IVisualFactory;

  applyObservables(type: IAttributeType, instance: IAttributeComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior;
  applyObservables(type: IElementType, instance: IElementComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior
}

export const ITemplateEngine = DI.createInterface<ITemplateEngine>()
  .withDefault(x => x.singleton(TemplateEngine));

@inject(IContainer, ITaskQueue)
class TemplateEngine implements ITemplateEngine {
  private templateLookup = new Map<ITemplateSource, ITemplate>();
  private factoryLookup = new Map<ITemplateSource, IVisualFactory>();
  private behaviorLookup = new Map<IElementType | IAttributeType, RuntimeBehavior>();

  constructor(private container: IContainer, private taskQueue: ITaskQueue) {}

  getElementTemplate(source: ITemplateSource, componentType: IElementType): ITemplate {
    if (!source) {
      return null;
    }

    let found = this.templateLookup.get(source);

    if (!found) {
      found = ViewEngine.templateFromCompiledSource(this.container, source);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.container !== null) {
        componentType.register(found.container);
      }

      this.templateLookup.set(source, found);
    }

    return found;
  }

  getVisualFactory(container: IContainer, source: ITemplateSource): IVisualFactory {
    if (!source) {
      return null;
    }

    let found = this.factoryLookup.get(source);

    if (!found) {
      found = ViewEngine.factoryFromCompiledSource(container, source);
      this.factoryLookup.set(source, found);
    }

    return found;
  }

  applyObservables(type: IAttributeType | IElementType, instance: IAttributeComponent | IElementComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior {
    let found = this.behaviorLookup.get(type);

    if (!found) {
      found = RuntimeBehavior.create(instance, observables, type);
      this.behaviorLookup.set(type, found);
    }

    if ('$host' in instance) {
      found.applyToElement(this.taskQueue, instance);
    } else {
      found.applyToAttribute(this.taskQueue, instance);
    }

    return found;
  }
}

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

class RuntimeBehavior implements IRuntimeBehavior {
  private constructor() {}

  observables: Record<string, IBindableInstruction>;
  hasCreated = false;
  hasBound = false;
  hasAttaching = false;
  hasAttached = false;
  hasDetaching = false;
  hasDetached = false;
  hasUnbound = false;
  hasCreateView = false;

  static create(instance, observables: Record<string, IBindableInstruction>, Component: IElementType | IAttributeType) {
    let behavior = new RuntimeBehavior();

    for (let name in instance) {
      if (name in observables) {
        continue;
      }

      const callback = `${name}Changed`;

      if (callback in instance) {
        observables[name] = { callback };
      }
    }

    behavior.observables = observables;
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
    const finalObservables = this.observables;
    const observableNames = Object.getOwnPropertyNames(finalObservables);
  
    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];
      const observable = finalObservables[name];
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
  let components: IElementComponent[] = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const current = nodes[i];
    const component = DOM.getComponentForNode(current);
    
    if (component !== null) {
      components.push(component);
    }
  }

  return components;
}
