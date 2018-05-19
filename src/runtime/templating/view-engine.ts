import { PLATFORM } from "../platform";
import { View, IViewOwner } from "./view";
import { IElementComponent, IAttributeComponent, IElementType } from "./component";
import { IBinding, Binding } from "../binding/binding";
import { IRenderSlot, RenderSlot } from "./render-slot";
import { IEmulatedShadowSlot, ShadowDOMEmulation } from "./shadow-dom";
import { Listener } from "../binding/listener";
import { Call } from "../binding/call";
import { Ref } from "../binding/ref";
import { Expression } from "../binding/expression";
import { DI, IContainer, IResolver, IRegistration } from "../di";
import { BindingMode } from "../binding/binding-mode";
import { IBindScope } from "../binding/observation";
import { IScope } from "../binding/binding-context";
import { Constructable } from "../interfaces";
import { IAttach, AttachContext, DetachContext } from "./lifecycle";
import { Reporter } from "../reporter";
import { ITargetedInstruction, IHydrateElementInstruction, ICompiledViewSource, TargetedInstructionType, ITextBindingInstruction, IOneWayBindingInstruction, IFromViewBindingInstruction, ITwoWayBindingInstruction, IListenerBindingInstruction, ICallBindingInstruction, IRefBindingInstruction, IStylePropertyBindingInstruction, ISetPropertyInstruction, ISetAttributeInstruction, IHydrateSlotInstruction, IHydrateAttributeInstruction, IHydrateTemplateController } from "./instructions";
import { INode, DOM, IView, } from "../dom";
import { IAnimator } from "./animator";
import { ITaskQueue } from "../task-queue";
import { IObserverLocator } from "../binding/observer-locator";
import { IEventManager } from "../binding/event-manager";

export interface ITemplate {
  readonly container: ITemplateContainer;
  createFor(owner: IViewOwner, host?: INode, replacements?: Record<string, ICompiledViewSource>): IView;
}

const noViewTemplate: ITemplate = {
  container: null,
  createFor(owner: IViewOwner) {
    return View.none;
  }
};

type RenderCallback = (visual: IVisual, owner: any, index?: number) => void;

export interface IVisual extends IBindScope, IViewOwner { 
  /**
  * The IViewFactory that built this instance.
  */
  readonly factory: IVisualFactory;

  /**
   *   Runs the animator against the first animatable element found within the view's fragment
   *   @param  visual The view to use when searching for the element.
   *   @param  direction The animation direction enter|leave.
   *   @returns An animation complete Promise or undefined if no animation was run.
   */
  animate(direction: 'enter' | 'leave'): void | Promise<boolean>;

  /**
  * Attempts to return this view to the appropriate view cache.
  */
  tryReturnToCache(): boolean;

  $attach(context: AttachContext | null, render: RenderCallback, owner: any, index?: number);

  $detach(context?: DetachContext);
}

export const IVisualFactory = DI.createInterface('IVisualFactory');

export interface IVisualFactory {
  readonly name: string;

  /**
  * Indicates whether this factory is currently using caching.
  */
  readonly isCaching: boolean;

  /**
  * Sets the cache size for this factory.
  * @param size The number of visuals to cache or "*" to cache all.
  * @param doNotOverrideIfAlreadySet Indicates that setting the cache should not override the setting if previously set.
  */
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;

  /**
  * Creates a visual or returns one from the internal cache, if available.
  * @return The created visual.
  */
  create(): IVisual;
}

export type VisualWithCentralComponent = IVisual & { component: IElementComponent };

export const ViewEngine = {
  templateFromCompiledSource(container: IContainer, source: ICompiledViewSource): ITemplate {
    if (source && source.template) {
      return new CompiledTemplate(container, source);
    }

    return noViewTemplate;
  },

  factoryFromCompiledSource(container: IContainer, source: ICompiledViewSource): IVisualFactory {
    const template = ViewEngine.templateFromCompiledSource(container, source);

    const CompiledVisual = class extends Visual {
      static template: ITemplate = template;
      static source: ICompiledViewSource = source;

      $slots: Record<string, IEmulatedShadowSlot> = source.hasSlots ? {} : null;

      createView() {
        return template.createFor(this);
      }
    }

    return new DefaultVisualFactory(source.name, CompiledVisual);
  },

  visualFromComponent(container: ITemplateContainer, componentOrType: any, instruction: IHydrateElementInstruction): VisualWithCentralComponent {
    class ComponentVisual extends Visual {
      static template: ITemplate = Object.assign({}, noViewTemplate, { container });
      static source: ICompiledViewSource = null;

      public component: IElementComponent;

      constructor() {
        super(null, null); // TODO: IAnimator inject
      }

      createView() {
        let target: INode;

        const interpreter = new InstructionInterpreter(
          container,
          container.get(ITaskQueue),
          container.get(IObserverLocator),
          container.get(IEventManager),
          this
        );

        if (typeof componentOrType === 'function') {
          target = DOM.createElement(componentOrType.source.name);
          interpreter[TargetedInstructionType.hydrateElement](target, instruction);
          this.component = <IElementComponent>this.$attachable[this.$attachable.length - 1];
        } else {
          const componentType = <IElementType>componentOrType.constructor;
          target = componentOrType.element || DOM.createElement(componentType.source.name);
          interpreter.applyElementInstructionToComponentInstance(target, instruction, componentOrType);
          this.component = componentOrType;
        }

        return View.fromNode(target);
      }

      tryReturnToCache() {
        return false;
      }
    }

    return new ComponentVisual();
  }
};

class InstructionInterpreter {
  constructor(
    private container: ITemplateContainer,
    private taskQueue: ITaskQueue, 
    private observerLoator: IObserverLocator,
    private eventManager: IEventManager,
    private owner: IViewOwner,
    private host?: INode, 
    private replacements?: Record<string, ICompiledViewSource>
  ) {}

  [TargetedInstructionType.textBinding](target: any, instruction: ITextBindingInstruction) {
    let next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    this.owner.$bindable.push(new Binding(Expression.from(instruction.src), next, 'textContent', BindingMode.oneWay, this.observerLoator, this.container));
  }

  [TargetedInstructionType.oneWayBinding](target: any, instruction: IOneWayBindingInstruction) {
    this.owner.$bindable.push(new Binding(Expression.from(instruction.src), target, instruction.dest, BindingMode.oneWay, this.observerLoator, this.container));
  }

  [TargetedInstructionType.fromViewBinding](target: any, instruction: IFromViewBindingInstruction) {
    this.owner.$bindable.push(new Binding(Expression.from(instruction.src), target, instruction.dest, BindingMode.fromView, this.observerLoator, this.container));
  }

  [TargetedInstructionType.twoWayBinding](target: any, instruction: ITwoWayBindingInstruction) {
    this.owner.$bindable.push(new Binding(Expression.from(instruction.src), target, instruction.dest, BindingMode.twoWay, this.observerLoator, this.container));
  }

  [TargetedInstructionType.listenerBinding](target: any, instruction: IListenerBindingInstruction) {
    this.owner.$bindable.push(new Listener(instruction.src, instruction.strategy, Expression.from(instruction.dest), target, instruction.preventDefault, this.eventManager, this.container));
  }

  [TargetedInstructionType.callBinding](target: any, instruction: ICallBindingInstruction) {
    this.owner.$bindable.push(new Call(Expression.from(instruction.src), target, instruction.dest, this.observerLoator, this.container));
  }

  [TargetedInstructionType.refBinding](target: any, instruction: IRefBindingInstruction) {
    this.owner.$bindable.push(new Ref(Expression.from(instruction.src), target, this.container));
  }

  [TargetedInstructionType.stylePropertyBinding](target: any, instruction: IStylePropertyBindingInstruction) {
    this.owner.$bindable.push(new Binding(Expression.from(instruction.src), (<any>target).style, instruction.dest, BindingMode.oneWay, this.observerLoator, this.container));
  }

  [TargetedInstructionType.setProperty](target: any, instruction: ISetPropertyInstruction) {
    target[instruction.dest] = instruction.value;
  }

  [TargetedInstructionType.setAttribute](target: any, instruction: ISetAttributeInstruction) {
    DOM.setAttribute(target, instruction.dest, instruction.value);
  }

  [TargetedInstructionType.hydrateSlot](target: any, instruction: IHydrateSlotInstruction) {
    let owner: IElementComponent = <any>this.owner;
    
    if (!owner.$usingSlotEmulation) {
      return;
    }

    let fallbackFactory = (<any>instruction).factory;

    if (fallbackFactory === undefined && instruction.fallback) {
      (<any>instruction).factory = fallbackFactory = ViewEngine.factoryFromCompiledSource(this.container, instruction.fallback);
    }

    let slot = ShadowDOMEmulation.createSlot(target, owner, instruction.name, instruction.dest, fallbackFactory);
    owner.$slots[slot.name] = slot;
    owner.$bindable.push(slot);
    owner.$attachable.push(slot);
  }

  [TargetedInstructionType.hydrateElement](target: any, instruction: IHydrateElementInstruction) {
    let container = this.container;

    container.element.prepare(target);
    container.owner.prepare(this.owner);
    container.instruction.prepare(instruction);
    container.slot.prepare(target, true);
    
    let component = container.get<IElementComponent>(instruction.res);
    this.applyElementInstructionToComponentInstance(target, instruction, component);
    container.slot.connectCustomElement(component);
    
    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();
    container.slot.dispose();
  }

  [TargetedInstructionType.hydrateAttribute](target: any, instruction: IHydrateAttributeInstruction) {
    let childInstructions = instruction.instructions;
    let container = this.container;
    let owner = this.owner;

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);

    let component = container.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.taskQueue);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      (<any>this[current.type])(component, current);
    }

    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();

    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }

  [TargetedInstructionType.hydrateTemplateController](target: any, instruction: IHydrateTemplateController) {
    let childInstructions = instruction.instructions;
    let factory = (<any>instruction).factory;
    let container = this.container;
    let owner = this.owner;

    if (factory === undefined) {
      (<any>instruction).factory = factory = ViewEngine.factoryFromCompiledSource(container, instruction.src);
    }

    container.element.prepare(target);
    container.owner.prepare(owner);
    container.instruction.prepare(instruction);
    container.factory.prepare(factory, this.replacements);
    container.slot.prepare(DOM.convertToAnchor(target), false);

    let component = container.get<IAttributeComponent>(instruction.res);
    component.$hydrate(this.taskQueue);
    container.slot.connectTemplateController(component);

    if (instruction.link) {
      (<any>component).link(owner.$attachable[owner.$attachable.length - 1]);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      let current = childInstructions[i];
      (<any>this[current.type])(component, current);
    }

    container.element.dispose();
    container.owner.dispose();
    container.instruction.dispose();
    container.factory.dispose();
    container.slot.dispose();

    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }

  applyElementInstructionToComponentInstance(target: INode, instruction: IHydrateElementInstruction, component: IElementComponent) {
    let childInstructions = instruction.instructions;
    let owner = this.owner;
  
    component.$hydrate(
      this.container,
      this.taskQueue,
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
  
      (<any>this[current.type])(realTarget, current);
    }
  
    owner.$bindable.push(component);
    owner.$attachable.push(component);
  }
}

class InstanceProvider<T> implements IResolver {
  private instance: T = null;

  prepare(instance: T) {
    this.instance = instance;
  }

  get(handler: IContainer, requestor: IContainer) {
    return this.instance;
  }

  dispose() {
    this.instance = null;
  }
}

class ViewFactoryProvider implements IResolver {
  private factory: IVisualFactory
  private replacements: Record<string, ICompiledViewSource>;

  prepare(factory: IVisualFactory, replacements: Record<string, ICompiledViewSource>) { 
    this.factory = factory;
    this.replacements = replacements || PLATFORM.emptyObject;
  }

  get(handler: IContainer, requestor: IContainer) {
    let found = this.replacements[this.factory.name];

    if (found) {
      if ((<any>found).factory) {
        return (<any>found).factory;
      }

      return (<any>found).factory = ViewEngine.factoryFromCompiledSource(requestor, found);
    }

    return this.factory;
  }

  dispose() {
    this.factory = null;
    this.replacements = null;
  }
}

class RenderSlotProvider implements IResolver {
  private node: INode = null;
  private anchorIsContainer = false;
  private slot: IRenderSlot = null;

  prepare(element: INode, anchorIsContainer = false) {
    this.node = element;
    this.anchorIsContainer = anchorIsContainer;
  }

  get(handler: IContainer, requestor: IContainer) {
    return this.slot || (this.slot = RenderSlot.create(this.node, this.anchorIsContainer));
  }

  connectTemplateController(owner) {
    const slot = this.slot;

    if (slot !== null) {
      (<any>slot).$isContentProjectionSource = true; // Usage: Shadow DOM Emulation
      owner.$slot = slot; // Usage: Custom Attributes
    }
  }

  connectCustomElement(owner) {
    const slot = this.slot;

    if (slot !== null) {
      owner.$slot = slot; // Usage: Custom Elements
    }
  }

  dispose() {
    this.node = null;
    this.slot = null;
  }
}

export interface ITemplateContainer extends IContainer {
  element: InstanceProvider<INode>;
  factory: ViewFactoryProvider;
  slot: RenderSlotProvider;
  owner: InstanceProvider<IViewOwner>;
  instruction: InstanceProvider<ITargetedInstruction>
};

function createTemplateContainer(parentContainer: IContainer, dependencies: any[]) {
  let container = <ITemplateContainer>parentContainer.createChild();

  container.element = new InstanceProvider();
  DOM.registerElementResolver(container, container.element);

  container.registerResolver(IVisualFactory, container.factory = new ViewFactoryProvider());
  container.registerResolver(IRenderSlot, container.slot = new RenderSlotProvider());
  container.registerResolver(IViewOwner, container.owner =  new InstanceProvider());
  container.registerResolver(ITargetedInstruction, container.instruction = new InstanceProvider());

  if (dependencies) {
    container.register(...dependencies);
  }

  return container;
}

class CompiledTemplate implements ITemplate {
  private createView: () => IView;
  container: ITemplateContainer;

  constructor(container: IContainer, private source: ICompiledViewSource) {
    this.container = createTemplateContainer(container, source.dependencies);
    this.createView = DOM.createFactoryFromMarkup(source.template);
  }

  createFor(owner: IViewOwner, host?: INode, replacements?: Record<string, ICompiledViewSource>): IView {
    const source = this.source;
    const view = this.createView();
    const targets = view.findTargets();
    const container = this.container;

    const targetInstructions = source.targetInstructions;
    const interpreter = new InstructionInterpreter(
      container,
      container.get(ITaskQueue),
      container.get(IObserverLocator),
      container.get(IEventManager),
      owner,
      host,
      replacements
    );

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      let instructions = targetInstructions[i];
      let target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        let current = instructions[j];
        (<any>interpreter[current.type])(target, current);
      }
    }

    if (host) {
      const surrogateInstructions = source.surrogateInstructions;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        let current = surrogateInstructions[i];
        (<any>interpreter[current.type])(host, current);
      }
    }

    return view;
  }
}

abstract class Visual implements IVisual {
  $bindable: IBindScope[] = [];
  $attachable: IAttach[] = [];
  $scope: IScope = null;
  $view: IView = null;
  $isBound = false;
  $isAttached = false;
  
  inCache = false;
  private animationRoot: INode = undefined;

  constructor(public factory: DefaultVisualFactory, private animator: IAnimator) {
    this.$view = this.createView();
  }

  abstract createView(): IView;

  private getAnimationRoot(): INode {
    if (this.animationRoot !== undefined) {
      return this.animationRoot;
    }
  
    let currentChild = this.$view.firstChild;
    const lastChild = this.$view.lastChild;
    const isElementNodeType = DOM.isElementNodeType;
  
    while (currentChild !== lastChild && !isElementNodeType(currentChild)) {
      currentChild = currentChild.nextSibling;
    }
  
    if (currentChild && isElementNodeType(currentChild)) {
      return this.animationRoot = DOM.hasClass(currentChild, 'au-animate') 
        ? currentChild 
        : null;
    }
  
    return this.animationRoot = null;
  }

  animate(direction: 'enter' | 'leave' = 'enter'): void | Promise<boolean> {
    const element = this.getAnimationRoot();

    if (element === null) {
      return;
    }

    switch (direction) {
      case 'enter':
        return this.animator.enter(element);
      case 'leave':
        return this.animator.leave(element);
      default:
        throw Reporter.error(4, direction);
    }
  }

  $bind(scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind();
    }

    this.$scope = scope;

    const bindable = this.$bindable;

    for (let i = 0, ii = bindable.length; i < ii; ++i) {
      bindable[i].$bind(scope);
    }

    this.$isBound = true;
  }

  $attach(context: AttachContext | null, render: RenderCallback, owner: IRenderSlot, index?: number) {
    if (this.$isAttached) {
      return;
    }

    if (!context) {
      context = AttachContext.open(this);
    }

    let attachable = this.$attachable;

    for (let i = 0, ii = attachable.length; i < ii; ++i) {
      attachable[i].$attach(context);
    }

    render(this, owner, index);

    this.$isAttached = true;

    if (context.wasOpenedBy(this)) {
      context.close();
    }
  }

  $detach(context?: DetachContext) { 
    if (this.$isAttached) {
      if (!context) {
        context = DetachContext.open(this);
      }

      context.queueForViewRemoval(this);

      const attachable = this.$attachable;
      let i = attachable.length;

      while (i--) {
        attachable[i].$detach(context);
      }

      this.$isAttached = false;

      if (context.wasOpenedBy(this)) {
        context.close();
      }
    }
  }

  $unbind() {
    if (this.$isBound) {
      const bindable = this.$bindable;
      let i = bindable.length;

      while (i--) {
        bindable[i].$unbind();
      }

      this.$isBound = false;
      this.$scope = null;
    }
  }

  tryReturnToCache() {
    return this.factory.tryReturnToCache(this);
  }
}

class DefaultVisualFactory implements IVisualFactory {
  private cacheSize = -1;
  private cache: Visual[] = null;

  public isCaching = false;

  constructor(public name: string, private type: Constructable<Visual>) {}

  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
    if (size) {
      if (size === '*') {
        size = Number.MAX_VALUE;
      } else if (typeof size === 'string') {
        size = parseInt(size, 10);
      }

      if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
        this.cacheSize = size;
      }
    }

    if (this.cacheSize > 0) {
      this.cache = [];
    } else {
      this.cache = null;
    }

    this.isCaching = this.cacheSize > 0;
  }

  tryReturnToCache(visual: Visual): boolean {
    if (this.cache !== null && this.cache.length < this.cacheSize) {
      visual.inCache = true;
      this.cache.push(visual);
      return true;
    }

    return false;
  }

  create(): Visual {
    const cache = this.cache;

    if (cache !== null && cache.length > 0) {
      let visual = cache.pop();
      visual.inCache = false;
      return visual;
    }

    return new this.type(this);
  }
}
