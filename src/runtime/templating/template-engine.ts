import { IContainer, DI, inject } from '../di';
import { ITemplate, ViewEngine, IVisualFactory, ITemplateContainer } from './view-engine';
import { ITemplateSource, IBindableInstruction, TargetedInstructionType, IHydrateSlotInstruction, ISetAttributeInstruction, ISetPropertyInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IStylePropertyBindingInstruction, IRefBindingInstruction, ICallBindingInstruction, IListenerBindingInstruction, ITwoWayBindingInstruction, IFromViewBindingInstruction, IOneWayBindingInstruction, ITextBindingInstruction, ITargetedInstruction } from './instructions';
import { IElementType, IAttributeType, IAttributeComponent, IElementComponent } from './component';
import { ITaskQueue } from '../task-queue';
import { Observer } from '../binding/property-observation';
import { IChildObserver, DOM, INode } from '../dom';
import { SubscriberCollection } from '../binding/subscriber-collection';
import { IAccessor, ISubscribable } from '../binding/observation';
import { ICallable } from '../interfaces';
import { IViewOwner } from './view';
import { ShadowDOMEmulation } from './shadow-dom';
import { Binding } from '../binding/binding';
import { Ref } from '../binding/ref';
import { BindingMode } from '../binding/binding-mode';
import { Call } from '../binding/call';
import { Listener } from '../binding/listener';
import { IObserverLocator } from '../binding/observer-locator';
import { IEventManager } from '../binding/event-manager';
import { IParser } from '../binding/parser';

export interface ITemplateEngine {
  getElementTemplate(source: ITemplateSource, componentType: IElementType): ITemplate;
  getVisualFactory(container: IContainer, source: ITemplateSource): IVisualFactory;

  applyRuntimeBehavior(type: IAttributeType, instance: IAttributeComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior;
  applyRuntimeBehavior(type: IElementType, instance: IElementComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior

  createInstructionInterpreter(container: ITemplateContainer): IInstructionInterpreter;
}

export const ITemplateEngine = DI.createInterface<ITemplateEngine>()
  .withDefault(x => x.singleton(TemplateEngine));

@inject(IContainer, ITaskQueue, IObserverLocator, IEventManager, IParser)
class TemplateEngine implements ITemplateEngine {
  private templateLookup = new Map<ITemplateSource, ITemplate>();
  private factoryLookup = new Map<ITemplateSource, IVisualFactory>();
  private behaviorLookup = new Map<IElementType | IAttributeType, RuntimeBehavior>();

  constructor(
    private container: IContainer, 
    private taskQueue: ITaskQueue,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IParser
  ) {}

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

  applyRuntimeBehavior(type: IAttributeType | IElementType, instance: IAttributeComponent | IElementComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior {
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

  createInstructionInterpreter(container: ITemplateContainer): IInstructionInterpreter {
    return new InstructionInterpreter(
      container,
      this.taskQueue,
      this.observerLocator,
      this.eventManager,
      this.parser,
      this
    );
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

export interface IInstructionInterpreter {
  interpret(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>): void;
  applyElementInstructionToComponentInstance(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent): void;
}

class InstructionInterpreter {
  constructor(
    private container: ITemplateContainer,
    private taskQueue: ITaskQueue, 
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IParser,
    private templateEngine: ITemplateEngine
  ) {}

  interpret(owner: IViewOwner, targets: ArrayLike<INode>, source: ITemplateSource, host?: INode, replacements?: Record<string, ITemplateSource>): void {
    let targetInstructions = source.instructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      let instructions = targetInstructions[i];
      let target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        let current = instructions[j];
        (<any>this[current.type])(owner, target, current, replacements);
      }
    }

    if (host) {
      const surrogateInstructions = source.surrogates;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        let current = surrogateInstructions[i];
        (<any>this[current.type])(owner, host, current, replacements);
      }
    }
  }

  [TargetedInstructionType.textBinding](owner: IViewOwner,target: any, instruction: ITextBindingInstruction) {
    let next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), next, 'textContent', BindingMode.oneWay, this.observerLocator, this.container));
  }

  [TargetedInstructionType.oneWayBinding](owner: IViewOwner,target: any, instruction: IOneWayBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.oneWay, this.observerLocator, this.container));
  }

  [TargetedInstructionType.fromViewBinding](owner: IViewOwner,target: any, instruction: IFromViewBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.fromView, this.observerLocator, this.container));
  }

  [TargetedInstructionType.twoWayBinding](owner: IViewOwner,target: any, instruction: ITwoWayBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), target, instruction.dest, BindingMode.twoWay, this.observerLocator, this.container));
  }

  [TargetedInstructionType.listenerBinding](owner: IViewOwner,target: any, instruction: IListenerBindingInstruction) {
    owner.$bindable.push(new Listener(instruction.src, instruction.strategy, this.parser.parse(instruction.dest), target, instruction.preventDefault, this.eventManager, this.container));
  }

  [TargetedInstructionType.callBinding](owner: IViewOwner,target: any, instruction: ICallBindingInstruction) {
    owner.$bindable.push(new Call(this.parser.parse(instruction.src), target, instruction.dest, this.observerLocator, this.container));
  }

  [TargetedInstructionType.refBinding](owner: IViewOwner,target: any, instruction: IRefBindingInstruction) {
    owner.$bindable.push(new Ref(this.parser.parse(instruction.src), target, this.container));
  }

  [TargetedInstructionType.stylePropertyBinding](owner: IViewOwner,target: any, instruction: IStylePropertyBindingInstruction) {
    owner.$bindable.push(new Binding(this.parser.parse(instruction.src), (<any>target).style, instruction.dest, BindingMode.oneWay, this.observerLocator, this.container));
  }

  [TargetedInstructionType.setProperty](owner: IViewOwner, target: any, instruction: ISetPropertyInstruction) {
    target[instruction.dest] = instruction.value;
  }

  [TargetedInstructionType.setAttribute](owner: IViewOwner, target: any, instruction: ISetAttributeInstruction) {
    DOM.setAttribute(target, instruction.dest, instruction.value);
  }

  [TargetedInstructionType.hydrateSlot](owner: IElementComponent, target: any, instruction: IHydrateSlotInstruction) {   
    if (!owner.$usingSlotEmulation) {
      return;
    }

    let fallbackFactory = this.templateEngine.getVisualFactory(this.container, instruction.fallback);
    let slot = ShadowDOMEmulation.createSlot(target, owner, instruction.name, instruction.dest, fallbackFactory);

    owner.$slots[slot.name] = slot;
    owner.$bindable.push(slot);
    owner.$attachable.push(slot);
  }

  [TargetedInstructionType.hydrateElement](owner: IViewOwner, target: any, instruction: IHydrateElementInstruction) {
    let container = this.container;

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);
    container.slot.prepare(target, true);
    
    let component = container.get<IElementComponent>(instruction.res);
    this.applyElementInstructionToComponentInstance(owner, target, instruction, component);
    container.slot.connectCustomElement(component);
    
    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();
    container.slot.dispose();
  }

  [TargetedInstructionType.hydrateAttribute](owner: IViewOwner, target: any, instruction: IHydrateAttributeInstruction) {
    let childInstructions = instruction.instructions;
    let container = this.container;

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);

    let component = container.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.templateEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      (<any>this[current.type])(owner, component, current);
    }

    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();

    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }

  [TargetedInstructionType.hydrateTemplateController](owner: IViewOwner, target: any, instruction: IHydrateTemplateController, replacements?: Record<string, ITemplateSource>) {
    let childInstructions = instruction.instructions;
    let factory = this.templateEngine.getVisualFactory(this.container, instruction.src);
    let container = this.container;

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);
    container.factory.prepare(factory, replacements);
    container.slot.prepare(DOM.convertToAnchor(target), false);

    let component = container.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.templateEngine);
    container.slot.connectTemplateController(component);

    if (instruction.link) {
      (<any>component).link(owner.$attachable[owner.$attachable.length - 1]);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      (<any>this[current.type])(owner, component, current);
    }

    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();
    container.factory.dispose();
    container.slot.dispose();

    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }

  applyElementInstructionToComponentInstance(owner: IViewOwner, target: INode, instruction: IHydrateElementInstruction, component: IElementComponent) {
    let childInstructions = instruction.instructions;
  
    component.$hydrate(
      this.templateEngine,
      target, 
      instruction.replacements,
      instruction.contentElement
    );
    
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      let currentType = current.type;
      let realTarget;
      
      if (currentType === TargetedInstructionType.stylePropertyBinding || currentType === TargetedInstructionType.listenerBinding) {
        realTarget = target;
      } else {
        realTarget = component;
      }
  
      (<any>this[current.type])(owner, realTarget, current);
    }
  
    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }
}
