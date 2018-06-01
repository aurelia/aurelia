import { RuntimeBehavior, IRuntimeBehavior } from "./runtime-behavior";
import { IAttributeType, IElementType, IAttributeComponent, IElementComponent } from "./component";
import { DI, IContainer, inject, IResolver } from "../di";
import { ITemplateSource, IBindableInstruction, ITargetedInstruction, TargetedInstructionType, IHydrateElementInstruction } from "./instructions";
import { ITaskQueue } from "../task-queue";
import { IViewOwner, View } from "./view";
import { INode, IView, DOM } from "../dom";
import { IRenderer, Renderer } from "./renderer";
import { IRenderSlot, RenderSlot } from "./render-slot";
import { Constructable } from "../interfaces";
import { DetachLifecycle, AttachLifecycle, IAttach } from "./lifecycle";
import { IScope } from "../binding/binding-context";
import { Reporter } from "../reporter";
import { IAnimator } from "./animator";
import { IBindScope } from "../binding/observation";
import { PLATFORM } from "../platform";
import { IEmulatedShadowSlot } from "./shadow-dom";
import { IRenderContext, createRenderContext, IComponentOperation } from "./render-context";
import { IVisualFactory, VisualWithCentralComponent, IVisual, RenderCallback, MotionDirection } from "./visual";
import { ITemplate } from "./template";
import { IObserverLocator } from "../binding/observer-locator";
import { IEventManager } from "../binding/event-manager";
import { IExpressionParser } from "../binding/expression-parser";

export interface IRenderingEngine {
  getElementTemplate(source: ITemplateSource, componentType: IElementType): ITemplate;
  getVisualFactory(context: IRenderContext, source: ITemplateSource): IVisualFactory;

  applyRuntimeBehavior(type: IAttributeType, instance: IAttributeComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior;
  applyRuntimeBehavior(type: IElementType, instance: IElementComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior

  createVisualFromComponent(context: IRenderContext, componentOrType: any, instruction: IHydrateElementInstruction): VisualWithCentralComponent;
  createRenderer(context: IRenderContext): IRenderer;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

const noViewTemplate: ITemplate = {
  context: null,
  createFor(owner: IViewOwner) {
    return View.none;
  }
};

type ExposedContext = IRenderContext & IComponentOperation & IContainer;

@inject(IContainer, ITaskQueue, IObserverLocator, IEventManager, IExpressionParser, IAnimator)
class RenderingEngine implements IRenderingEngine {
  private templateLookup = new Map<ITemplateSource, ITemplate>();
  private factoryLookup = new Map<ITemplateSource, IVisualFactory>();
  private behaviorLookup = new Map<IElementType | IAttributeType, RuntimeBehavior>();

  constructor(
    private container: IContainer, 
    private taskQueue: ITaskQueue,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private animator: IAnimator
  ) {}

  getElementTemplate(source: ITemplateSource, componentType: IElementType): ITemplate {
    if (!source) {
      return null;
    }

    let found = this.templateLookup.get(source);

    if (!found) {
      found = this.templateFromCompiledSource(<ExposedContext>this.container, source);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.context !== null) {
        componentType.register(<ExposedContext>found.context);
      }

      this.templateLookup.set(source, found);
    }

    return found;
  }

  private templateFromCompiledSource(context: IRenderContext, source: ITemplateSource): ITemplate {
    if (source && source.template) {
      return new CompiledTemplate(this, context, source);
    }

    return noViewTemplate;
  }

  getVisualFactory(context: IRenderContext, source: ITemplateSource): IVisualFactory {
    if (!source) {
      return null;
    }

    let found = this.factoryLookup.get(source);

    if (!found) {
      found = this.factoryFromCompiledSource(context, source);
      this.factoryLookup.set(source, found);
    }

    return found;
  }

  private factoryFromCompiledSource(context: IRenderContext, source: ITemplateSource): IVisualFactory {
    const template = this.templateFromCompiledSource(context, source);

    const CompiledVisual = class extends Visual {
      $slots: Record<string, IEmulatedShadowSlot> = source.hasSlots ? {} : null;
      $context = context;

      createView() {
        return template.createFor(this);
      }
    }

    return new VisualFactory(source.name, CompiledVisual);
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

  createVisualFromComponent(context: IRenderContext, componentOrType: any, instruction: IHydrateElementInstruction): VisualWithCentralComponent {
    let animator = this.animator;
    
    class ComponentVisual extends Visual {
      public component: IElementComponent;

      constructor() {
        super(null, animator);
        this.$context = context;
      }

      createView() {
        let target: INode;

        if (typeof componentOrType === 'function') {
          target = DOM.createElement(componentOrType.source.name);
          context.hydrateElement(this, target, instruction);
          this.component = <IElementComponent>this.$attachable[this.$attachable.length - 1];
        } else {
          const componentType = <IElementType>componentOrType.constructor;
          target = componentOrType.element || DOM.createElement(componentType.source.name);
          context.hydrateElementInstance(this, target, instruction, componentOrType);
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

  createRenderer(container: IRenderContext): IRenderer {
    return new Renderer(
      container,
      this.taskQueue,
      this.observerLocator,
      this.eventManager,
      this.parser,
      this
    );
  }
}

class CompiledTemplate implements ITemplate {
  private createView: () => IView;
  context: IRenderContext;

  constructor(renderingEngine: IRenderingEngine, parentContext: IRenderContext, private source: ITemplateSource) {
    this.context = createRenderContext(renderingEngine, parentContext, source.dependencies);
    this.createView = DOM.createFactoryFromMarkup(source.template);
  }

  createFor(owner: IViewOwner, host?: INode, replacements?: Record<string, ITemplateSource>): IView {
    const view = this.createView();
    this.context.render(owner, view.findTargets(), this.source, host, replacements);
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

  $attach(lifecycle: AttachLifecycle | null, render: RenderCallback, owner: IRenderSlot, index?: number) {
    if (this.$isAttached) {
      return;
    }

    lifecycle = AttachLifecycle.start(this, lifecycle);

    let attachable = this.$attachable;

    for (let i = 0, ii = attachable.length; i < ii; ++i) {
      attachable[i].$attach(lifecycle);
    }

    render(this, owner, index);

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
