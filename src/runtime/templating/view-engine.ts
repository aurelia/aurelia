import { PLATFORM } from '../platform';
import { View, IViewOwner } from './view';
import { IElementComponent, IAttributeComponent, IElementType } from './component';
import { IBinding, Binding } from '../binding/binding';
import { IRenderSlot, RenderSlot } from './render-slot';
import { IEmulatedShadowSlot, ShadowDOMEmulation } from './shadow-dom';
import { Listener } from '../binding/listener';
import { Call } from '../binding/call';
import { Ref } from '../binding/ref';
import { IParser } from '../binding/parser';
import { DI, IContainer, IResolver, IRegistration } from '../di';
import { BindingMode } from '../binding/binding-mode';
import { IBindScope } from '../binding/observation';
import { IScope } from '../binding/binding-context';
import { Constructable } from '../interfaces';
import { IAttach, AttachContext, DetachContext } from './lifecycle';
import { Reporter } from '../reporter';
import { ITargetedInstruction, IHydrateElementInstruction, ITemplateSource, TargetedInstructionType, ITextBindingInstruction, IOneWayBindingInstruction, IFromViewBindingInstruction, ITwoWayBindingInstruction, IListenerBindingInstruction, ICallBindingInstruction, IRefBindingInstruction, IStylePropertyBindingInstruction, ISetPropertyInstruction, ISetAttributeInstruction, IHydrateSlotInstruction, IHydrateAttributeInstruction, IHydrateTemplateController } from './instructions';
import { INode, DOM, IView, } from '../dom';
import { IAnimator } from './animator';
import { ITaskQueue } from '../task-queue';
import { IObserverLocator } from '../binding/observer-locator';
import { IEventManager } from '../binding/event-manager';
import { ITemplateEngine, IInstructionInterpreter } from './template-engine';

export interface ITemplate {
  readonly container: ITemplateContainer;
  createFor(owner: IViewOwner, host?: INode, replacements?: Record<string, ITemplateSource>): IView;
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
  templateFromCompiledSource(container: IContainer, source: ITemplateSource): ITemplate {
    if (source && source.template) {
      return new CompiledTemplate(container, source);
    }

    return noViewTemplate;
  },

  factoryFromCompiledSource(container: IContainer, source: ITemplateSource): IVisualFactory {
    const template = ViewEngine.templateFromCompiledSource(container, source);

    const CompiledVisual = class extends Visual {
      static template: ITemplate = template;
      static source: ITemplateSource = source;

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
      static source: ITemplateSource = null;

      public component: IElementComponent;

      constructor() {
        super(null, null); // TODO: IAnimator inject
      }

      createView() {
        let target: INode;

        if (typeof componentOrType === 'function') {
          target = DOM.createElement(componentOrType.source.name);
          container.interpreter[TargetedInstructionType.hydrateElement](target, instruction);
          this.component = <IElementComponent>this.$attachable[this.$attachable.length - 1];
        } else {
          const componentType = <IElementType>componentOrType.constructor;
          target = componentOrType.element || DOM.createElement(componentType.source.name);
          container.interpreter.applyElementInstructionToComponentInstance(this, target, instruction, componentOrType);
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

class InstanceProvider<T> implements IResolver {
  private instance: T = null;

  prepare(instance: T) {
    this.instance = instance;
  }

  resolve(handler: IContainer, requestor: IContainer) {
    return this.instance;
  }

  dispose() {
    this.instance = null;
  }
}

class ViewFactoryProvider implements IResolver {
  private factory: IVisualFactory
  private replacements: Record<string, ITemplateSource>;

  constructor(private templateEngine: ITemplateEngine) {}

  prepare(factory: IVisualFactory, replacements: Record<string, ITemplateSource>) { 
    this.factory = factory;
    this.replacements = replacements || PLATFORM.emptyObject;
  }

  resolve(handler: IContainer, requestor: IContainer) {
    let found = this.replacements[this.factory.name];

    if (found) {
      return this.templateEngine.getVisualFactory(requestor, found);
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

  resolve(handler: IContainer, requestor: IContainer) {
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
  interpreter: IInstructionInterpreter;
};

function createTemplateContainer(parentContainer: IContainer, dependencies: any[]) {
  let container = <ITemplateContainer>parentContainer.createChild();
  let templateEngine = container.get(ITemplateEngine);

  container.interpreter = templateEngine.createInstructionInterpreter(container);
  container.element = new InstanceProvider();
  DOM.registerElementResolver(container, container.element);

  container.registerResolver(IVisualFactory, container.factory = new ViewFactoryProvider(templateEngine));
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

  constructor(container: IContainer, private source: ITemplateSource) {
    this.container = createTemplateContainer(container, source.dependencies);
    this.createView = DOM.createFactoryFromMarkup(source.template);
  }

  createFor(owner: IViewOwner, host?: INode, replacements?: Record<string, ITemplateSource>): IView {
    const view = this.createView();
    this.container.interpreter.interpret(owner, view.findTargets(), this.source, host, replacements);
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
