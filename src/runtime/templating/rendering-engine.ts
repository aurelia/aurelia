import { RuntimeBehavior, IRuntimeBehavior } from "./runtime-behavior";
import { IAttributeType, IElementType, IAttributeComponent, IElementComponent } from "./component";
import { DI, IContainer } from "../../kernel/di";
import { inject } from '../../kernel/decorators';
import { ITemplateSource, IHydrateElementInstruction, TemplateDefinition, TemplatePartDefinitions, ObservableDefinitions } from "./instructions";
import { ITaskQueue } from "../task-queue";
import { IViewOwner, View } from "./view";
import { INode, IView, DOM } from "../dom";
import { IRenderer, Renderer } from "./renderer";
import { IRenderSlot } from "./render-slot";
import { Constructable, Immutable } from "../../kernel/interfaces";
import { DetachLifecycle, AttachLifecycle, IAttach } from "./lifecycle";
import { IScope } from "../binding/binding-context";
import { Reporter } from "../../kernel/reporter";
import { IAnimator } from "./animator";
import { IBindScope } from "../binding/observation";
import { PLATFORM } from "../../kernel/platform";
import { IEmulatedShadowSlot } from "./shadow-dom";
import { IRenderContext, createRenderContext, IComponentOperation } from "./render-context";
import { IVisualFactory, VisualWithCentralComponent, IVisual, RenderCallback, MotionDirection } from "./visual";
import { ITemplate } from "./template";
import { IObserverLocator } from "../binding/observer-locator";
import { IEventManager } from "../binding/event-manager";
import { IExpressionParser } from "../binding/expression-parser";

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType: IElementType): ITemplate;
  getVisualFactory(context: IRenderContext, source: Immutable<ITemplateSource>): IVisualFactory;

  applyRuntimeBehavior(type: IAttributeType, instance: IAttributeComponent, observables: ObservableDefinitions): IRuntimeBehavior;
  applyRuntimeBehavior(type: IElementType, instance: IElementComponent, observables: ObservableDefinitions): IRuntimeBehavior

  createVisualFromComponent(context: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): VisualWithCentralComponent;
  createRenderer(context: IRenderContext): IRenderer;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

const noViewTemplate: ITemplate = {
  renderContext: null,
  createFor(owner: IViewOwner) {
    return View.none;
  }
};

type ExposedContext = IRenderContext & IComponentOperation & IContainer;

@inject(IContainer, ITaskQueue, IObserverLocator, IEventManager, IExpressionParser, IAnimator)
class RenderingEngine implements IRenderingEngine {
  private templateLookup = new Map<TemplateDefinition, ITemplate>();
  private factoryLookup = new Map<Immutable<ITemplateSource>, IVisualFactory>();
  private behaviorLookup = new Map<IElementType | IAttributeType, RuntimeBehavior>();

  constructor(
    private container: IContainer, 
    private taskQueue: ITaskQueue,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private animator: IAnimator
  ) {}

  getElementTemplate(definition: TemplateDefinition, componentType: IElementType): ITemplate {
    if (!definition) {
      return null;
    }

    let found = this.templateLookup.get(definition);

    if (!found) {
      found = this.templateFromCompiledSource(<ExposedContext>this.container, definition);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.renderContext !== null) {
        componentType.register(<ExposedContext>found.renderContext);
      }

      this.templateLookup.set(definition, found);
    }

    return found;
  }

  private templateFromCompiledSource(renderContext: IRenderContext, templateDefinition: TemplateDefinition): ITemplate {
    if (templateDefinition && templateDefinition.template) {
      return new CompiledTemplate(this, renderContext, templateDefinition);
    }

    return noViewTemplate;
  }

  getVisualFactory(renderContext: IRenderContext, templateSource: Immutable<ITemplateSource>): IVisualFactory {
    if (!templateSource) {
      return null;
    }

    let found = this.factoryLookup.get(templateSource);

    if (!found) {
      let validSource = createDefinition(templateSource);
      found = this.factoryFromCompiledSource(renderContext, validSource);
      this.factoryLookup.set(templateSource, found);
    }

    return found;
  }

  private factoryFromCompiledSource(renderContext: IRenderContext, templateDefinition: TemplateDefinition): IVisualFactory {
    const template = this.templateFromCompiledSource(renderContext, templateDefinition);

    const CompiledVisual = class extends Visual {
      $slots: Record<string, IEmulatedShadowSlot> = templateDefinition.hasSlots ? {} : null;
      $context = renderContext;

      createView() {
        return template.createFor(this);
      }
    }

    return new VisualFactory(templateDefinition.name, CompiledVisual);
  }

  applyRuntimeBehavior(type: IAttributeType | IElementType, instance: IAttributeComponent | IElementComponent, observables: ObservableDefinitions): IRuntimeBehavior {
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

  createVisualFromComponent(renderContext: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): VisualWithCentralComponent {
    let animator = this.animator;
    
    class ComponentVisual extends Visual {
      public component: IElementComponent;

      constructor() {
        super(null, animator);
        this.$context = renderContext;
      }

      createView() {
        let target: INode;

        if (typeof componentOrType === 'function') {
          target = DOM.createElement(componentOrType.source.name);
          renderContext.hydrateElement(this, target, instruction);
          this.component = <IElementComponent>this.$attachable[this.$attachable.length - 1];
        } else {
          const componentType = <IElementType>componentOrType.constructor;
          target = componentOrType.element || DOM.createElement(componentType.definition.name);
          renderContext.hydrateElementInstance(this, target, instruction, componentOrType);
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

  createRenderer(renderContext: IRenderContext): IRenderer {
    return new Renderer(
      renderContext,
      this.taskQueue,
      this.observerLocator,
      this.eventManager,
      this.parser,
      this
    );
  }
}

function createDefinition(templateSource: Immutable<ITemplateSource>): TemplateDefinition {
  return {
    name: templateSource.name || 'Unnamed Template',
    template: templateSource.template,
    observables: templateSource.observables || PLATFORM.emptyObject,
    instructions: templateSource.instructions ? Array.from(templateSource.instructions) : PLATFORM.emptyArray,
    dependencies: templateSource.dependencies ? Array.from(templateSource.dependencies) : PLATFORM.emptyArray,
    surrogates: templateSource.surrogates ? Array.from(templateSource.surrogates) : PLATFORM.emptyArray,
    containerless: templateSource.containerless || false,
    shadowOptions: templateSource.shadowOptions || null,
    hasSlots: templateSource.hasSlots || false
  };
}

class CompiledTemplate implements ITemplate {
  private createView: () => IView;
  renderContext: IRenderContext;

  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
    this.createView = DOM.createFactoryFromMarkup(templateDefinition.template);
  }

  createFor(owner: IViewOwner, host?: INode, replacements?: TemplatePartDefinitions): IView {
    const view = this.createView();
    this.renderContext.render(owner, view.findTargets(), this.templateDefinition, host, replacements);
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
  $context: IRenderContext;
  parent: IRenderSlot;
  onRender: RenderCallback;
  renderState: any;
  
  inCache = false;
  private animationRoot: INode = undefined;

  constructor(public factory: VisualFactory, private animator: IAnimator) {
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

  animate(direction: MotionDirection = MotionDirection.enter): void | Promise<boolean> {
    const element = this.getAnimationRoot();

    if (element === null) {
      return;
    }

    switch (direction) {
      case MotionDirection.enter:
        return this.animator.enter(element);
      case MotionDirection.leave:
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

  $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle) {
    if (this.$isAttached) {
      return;
    }

    lifecycle = AttachLifecycle.start(this, lifecycle);

    let attachable = this.$attachable;

    for (let i = 0, ii = attachable.length; i < ii; ++i) {
      attachable[i].$attach(encapsulationSource, lifecycle);
    }

    this.onRender(this);
    this.$isAttached = true;
    lifecycle.end(this);
  }

  $detach(lifecycle?: DetachLifecycle) { 
    if (this.$isAttached) {
      lifecycle = DetachLifecycle.start(this, lifecycle);
      lifecycle.queueViewRemoval(this);

      const attachable = this.$attachable;
      let i = attachable.length;

      while (i--) {
        attachable[i].$detach(lifecycle);
      }

      this.$isAttached = false;
      lifecycle.end(this);
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

class VisualFactory implements IVisualFactory {
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
