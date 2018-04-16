import { DOM } from "../pal";
import { View, IView, IViewOwner } from "./view";
import { IElementComponent, IAttributeComponent } from "./component";
import { IBinding, Binding } from "../binding/binding";
import { ViewSlot } from "./view-slot";
import { IShadowSlot, ShadowDOM } from "./shadow-dom";
import { Listener } from "../binding/listener";
import { Call } from "../binding/call";
import { Ref } from "../binding/ref";
import { Expression } from "../binding/expression";
import { DI, IContainer, IResolver, IRegistration} from "../di";
import { BindingMode } from "../binding/binding-mode";
import { IBindScope } from "../binding/observation";
import { IScope } from "../binding/binding-context";
import { Constructable } from "../interfaces";
import { IAttach, AttachContext, DetachContext } from "./lifecycle";
import { Animator } from "./animator";
import { Reporter } from "../reporter";

export interface ITemplate {
  readonly container: IContainer;
  createFor(owner: IViewOwner, host?: Node): IView;
}

export interface IObservableDescription {
  name: string;
  changeHandler: string;
}

export interface ICompiledViewSource {
  template: string;
  targetInstructions: any[];
  dependencies?: any[];
  observables?: IObservableDescription[];
  containerless?: boolean;
  shadowOptions?: ShadowRootInit;
  hasSlots?: boolean;
  surrogateInstructions?: any[];
}

const noViewTemplate: ITemplate = {
  container: DI,
  createFor(owner: IViewOwner, host?: Node) {
    return View.none;
  }
};

type RenderCallback = (visual: IVisual, owner: any, index?: number) => void;

export interface IVisual extends IBindScope, IViewOwner { 
  /**
  * The IViewFactory that built this instance.
  */
  readonly factory: IViewFactory;

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

  attach(context: AttachContext | null, render: RenderCallback, owner: any, index?: number);

  detach(context?: DetachContext);
}

export const IViewFactory = DI.createInterface('IViewFactory');

export interface IViewFactory {
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

export const ViewEngine = {
  templateFromCompiledSource(source: ICompiledViewSource) {
    if (source && source.template) {
      return new CompiledTemplate(source);
    }

    return noViewTemplate;
  },

  factoryFromCompiledSource(source: ICompiledViewSource): IViewFactory {
    const template = ViewEngine.templateFromCompiledSource(source);

    const CompiledVisual = class extends Visual {
      static template: ITemplate = template;
      static source: ICompiledViewSource = source;

      $slots: Record<string, IShadowSlot> = source.hasSlots ? {} : null;

      createView() {
        return template.createFor(this);
      }
    }

    return new DefaultViewFactory(CompiledVisual);
  }
};

function applyInstruction(owner: IViewOwner, instruction, target, container: TemplateContainer) {
  switch(instruction.type) {
    case 'oneWayText':
      let next = target.nextSibling;
      DOM.treatNodeAsNonWhitespace(next);
      DOM.removeNode(target);
      owner.$bindable.push(new Binding(Expression.from(instruction.source), next, 'textContent', BindingMode.oneWay, container));
      break;
    case 'oneWay':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), target, instruction.target, BindingMode.oneWay, container));
      break;
    case 'fromView':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), target, instruction.target, BindingMode.fromView, container));
      break;
    case 'twoWay':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), target, instruction.target, BindingMode.twoWay, container));
      break;
    case 'listener':
      owner.$bindable.push(new Listener(instruction.source, instruction.strategy, Expression.from(instruction.target), target, instruction.preventDefault, container));
      break;
    case 'call':
      owner.$bindable.push(new Call(Expression.from(instruction.source), target, instruction.target, container));
      break;
    case 'ref':
      owner.$bindable.push(new Ref(Expression.from(instruction.source), target, container));
      break;
    case 'style':
      owner.$bindable.push(new Binding(Expression.from(instruction.source), (target as HTMLElement).style, instruction.target, BindingMode.oneWay, container));
      break;
    case 'property':
      target[instruction.target] = instruction.value;
      break;
    case 'slot':
      if (owner.$useShadowDOM) {
        return;
      }

      let fallbackFactory = instruction.factory;

      if (fallbackFactory === undefined && instruction.fallback) {
        instruction.factory = fallbackFactory = ViewEngine.factoryFromCompiledSource(instruction.fallback);
      }

      let slot = ShadowDOM.createSlot(target, owner, instruction.name, instruction.destination, fallbackFactory);
      owner.$slots[slot.name] = slot;
      owner.$bindable.push(slot);
      owner.$attachable.push(slot);
      break;
    case 'element':
      let elementInstructions = instruction.instructions;

      container.element.prepare(target);
      
      let elementModel = container.get<IElementComponent>(instruction.resource);
      elementModel.applyTo(target, View.fromCompiledElementContent(elementModel, target));

      for (let i = 0, ii = elementInstructions.length; i < ii; ++i) {
        let current = elementInstructions[i];
        let realTarget = current.type === 'style' || current.type === 'listener' ? target : elementModel;
        applyInstruction(owner, current, realTarget, container);
      }

      container.element.dispose();

      owner.$bindable.push(elementModel);
      owner.$attachable.push(elementModel);
      break;
    case 'attribute':
      let attributeInstructions = instruction.instructions;

      container.element.prepare(target);
      let attributeModel = container.get<IAttributeComponent>(instruction.resource);

      for (let i = 0, ii = attributeInstructions.length; i < ii; ++i) {
        applyInstruction(owner, attributeInstructions[i], attributeModel, container);
      }

      container.element.dispose();

      owner.$bindable.push(attributeModel);
      owner.$attachable.push(attributeModel);
      break;
    case 'templateController':
      let templateControllerInstructions = instruction.instructions;
      let factory = instruction.factory;

      if (factory === undefined) {
        instruction.factory = factory = ViewEngine.factoryFromCompiledSource(instruction.config);
      }

      container.element.prepare(target);
      container.viewFactory.prepare(factory);
      container.viewSlot.prepare(DOM.makeElementIntoAnchor(target), false);

      let templateControllerModel = container.get<IAttributeComponent>(instruction.resource);

      container.viewSlot.tryConnect(templateControllerModel);

      if (instruction.link) {
        (<any>templateControllerModel).link(owner.$attachable[owner.$attachable.length - 1]);
      }

      for (let i = 0, ii = templateControllerInstructions.length; i < ii; ++i) {
        applyInstruction(owner, templateControllerInstructions[i], templateControllerModel, container);
      }

      container.element.dispose();
      container.viewFactory.dispose();
      container.viewSlot.dispose();

      owner.$bindable.push(templateControllerModel);
      owner.$attachable.push(templateControllerModel);
      break;
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

class ViewSlotProvider implements IResolver {
  private element: Element = null;
  private anchorIsContainer = false;
  private viewSlot: ViewSlot = null;

  prepare(element: Element, anchorIsContainer = false) {
    this.element = element;
    this.anchorIsContainer = anchorIsContainer;
  }

  get(handler: IContainer, requestor: IContainer) {
    return this.viewSlot
      || (this.viewSlot = new ViewSlot(this.element, this.anchorIsContainer));
  }

  tryConnect(owner) {
    if (this.viewSlot !== null) {
      owner.$viewSlot = this.viewSlot;
    }
  }

  dispose() {
    this.element = null;
    this.viewSlot = null;
  }
}

type TemplateContainer = IContainer & {
  element: InstanceProvider<Element>,
  viewFactory: InstanceProvider<IViewFactory>,
  viewSlot: ViewSlotProvider
};

function createTemplateContainer(dependencies) {
  let container = <TemplateContainer>DI.createChild();

  container.registerResolver(Element, container.element = new InstanceProvider());
  container.registerResolver(IViewFactory, container.viewFactory = new InstanceProvider());
  container.registerResolver(ViewSlot, container.viewSlot = new ViewSlotProvider());

  if (dependencies) {
    container.register(...dependencies);
  }

  return container;
}

class CompiledTemplate implements ITemplate {
  private element: HTMLTemplateElement;
  container: TemplateContainer;

  constructor(private source: ICompiledViewSource) {
    this.container = createTemplateContainer(source.dependencies);
    this.element = DOM.createTemplateElement();
    this.element.innerHTML = source.template;
  }

  createFor(owner: IViewOwner, host?: Node): IView {
    const source = this.source;
    const view = View.fromCompiledTemplate(this.element);
    const targets = view.findTargets();
    const container = this.container;

    const targetInstructions = source.targetInstructions;

    for (let i = 0, ii = targets.length; i < ii; ++i) {
      let instructions = targetInstructions[i];
      let target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        applyInstruction(owner, instructions[j], target, container);
      }
    }

    if (host) {
      const surrogateInstructions = source.surrogateInstructions;
      
      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        applyInstruction(owner, surrogateInstructions[i], host, container);
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
  $inCache = false;
  $animationRoot: Element = undefined;

  constructor(public factory: DefaultViewFactory) {
    this.$view = this.createView();
  }

  abstract createView(): IView;

  getAnimationRoot(): Element {
    if (this.$animationRoot !== undefined) {
      return this.$animationRoot;
    }
  
    let currentChild = this.$view.firstChild;
    let lastChild = this.$view.lastChild;
  
    while (currentChild !== lastChild && currentChild.nodeType !== 1) {
      currentChild = currentChild.nextSibling;
    }
  
    if (currentChild && currentChild.nodeType === 1) {
      return this.$animationRoot = (<Element>currentChild).classList.contains('au-animate') 
        ? <Element>currentChild 
        : null;
    }
  
    return this.$animationRoot = null;
  }

  animate(direction: 'enter' | 'leave' = 'enter'): void | Promise<boolean> {
    const element = this.getAnimationRoot();

    if (element === null) {
      return;
    }

    switch (direction) {
      case 'enter':
        return Animator.enter(element);
      case 'leave':
        return Animator.leave(element);
      default:
        throw Reporter.error(4, direction);
    }
  }

  bind(scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.unbind();
    }

    this.$scope = scope;

    let bindable = this.$bindable;

    for (let i = 0, ii = bindable.length; i < ii; ++i) {
      bindable[i].bind(scope);
    }

    this.$isBound = true;
  }

  attach(context: AttachContext | null, render: RenderCallback, owner: ViewSlot, index?: number) {
    if (this.$isAttached) {
      return;
    }

    if (!context) {
      context = AttachContext.open(this);
    }

    let attachable = this.$attachable;

    for (let i = 0, ii = attachable.length; i < ii; ++i) {
      attachable[i].attach(context);
    }

    render(this, owner, index);

    this.$isAttached = true;

    if (context.wasOpenedBy(this)) {
      context.close();
    }
  }

  detach(context?: DetachContext) { 
    if (this.$isAttached) {
      if (!context) {
        context = DetachContext.open(this);
      }

      context.queueForViewRemoval(this);

      let attachable = this.$attachable;
      let i = attachable.length;

      while (i--) {
        attachable[i].detach(context);
      }

      this.$isAttached = false;

      if (context.wasOpenedBy(this)) {
        context.close();
      }
    }
  }

  unbind() {
    if (this.$isBound) {
      let bindable = this.$bindable;
      let i = bindable.length;

      while (i--) {
        bindable[i].unbind();
      }

      this.$isBound = false;
      this.$scope = null;
    }
  }

  tryReturnToCache() {
    return this.factory.tryReturnToCache(this);
  }
}

class DefaultViewFactory implements IViewFactory {
  private cacheSize = -1;
  private cache: Visual[] = null;

  public isCaching = false;

  constructor(private type: Constructable<Visual>) {}

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
      visual.$inCache = true;
      this.cache.push(visual);
      return true;
    }

    return false;
  }

  create(): Visual {
    const cache = this.cache;

    if (cache !== null && cache.length > 0) {
      let visual = cache.pop();
      visual.$inCache = false;
      return visual;
    }

    return new this.type(this);
  }
}
