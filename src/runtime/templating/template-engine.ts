import { RuntimeBehavior, IRuntimeBehavior } from "./runtime-behavior";
import { IAttributeType, IElementType, IAttributeComponent, IElementComponent } from "./component";
import { DI, IContainer, inject, IResolver } from "../di";
import { ITemplateSource, IBindableInstruction, ITargetedInstruction, TargetedInstructionType, IHydrateElementInstruction } from "./instructions";
import { ITaskQueue } from "../task-queue";
import { IViewOwner, View } from "./view";
import { INode, IView, DOM } from "../dom";
import { IInstructionInterpreter, InstructionInterpreter } from "./instruction-interpreter";
import { IRenderSlot, RenderSlot } from "./render-slot";
import { Constructable } from "../interfaces";
import { DetachContext, AttachContext, IAttach } from "./lifecycle";
import { IScope } from "../binding/binding-context";
import { Reporter } from "../reporter";
import { IAnimator } from "./animator";
import { IBindScope } from "../binding/observation";
import { PLATFORM } from "../platform";
import { IEmulatedShadowSlot } from "./shadow-dom";
import { ITemplateContainer, createTemplateContainer } from "./template-container";
import { IVisualFactory, VisualWithCentralComponent, IVisual, RenderCallback } from "./visual";
import { ITemplate } from "./template";
import { IObserverLocator } from "../binding/observer-locator";
import { IEventManager } from "../binding/event-manager";
import { IParser } from "../binding/parser";

export interface ITemplateEngine {
  getElementTemplate(source: ITemplateSource, componentType: IElementType): ITemplate;
  getVisualFactory(container: IContainer, source: ITemplateSource): IVisualFactory;

  applyRuntimeBehavior(type: IAttributeType, instance: IAttributeComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior;
  applyRuntimeBehavior(type: IElementType, instance: IElementComponent, observables: Record<string, IBindableInstruction>): IRuntimeBehavior

  createVisualFromComponent(container: ITemplateContainer, componentOrType: any, instruction: IHydrateElementInstruction): VisualWithCentralComponent;
  createInstructionInterpreter(container: ITemplateContainer): IInstructionInterpreter;
}

export const ITemplateEngine = DI.createInterface<ITemplateEngine>()
  .withDefault(x => x.singleton(TemplateEngine));

const noViewTemplate: ITemplate = {
  container: null,
  createFor(owner: IViewOwner) {
    return View.none;
  }
};

@inject(IContainer, ITaskQueue, IObserverLocator, IEventManager, IParser, IAnimator)
class TemplateEngine implements ITemplateEngine {
  private templateLookup = new Map<ITemplateSource, ITemplate>();
  private factoryLookup = new Map<ITemplateSource, IVisualFactory>();
  private behaviorLookup = new Map<IElementType | IAttributeType, RuntimeBehavior>();

  constructor(
    private container: IContainer, 
    private taskQueue: ITaskQueue,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IParser,
    private animator: IAnimator
  ) {}

  getElementTemplate(source: ITemplateSource, componentType: IElementType): ITemplate {
    if (!source) {
      return null;
    }

    let found = this.templateLookup.get(source);

    if (!found) {
      found = this.templateFromCompiledSource(this.container, source);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.container !== null) {
        componentType.register(found.container);
      }

      this.templateLookup.set(source, found);
    }

    return found;
  }

  private templateFromCompiledSource(container: IContainer, source: ITemplateSource): ITemplate {
    if (source && source.template) {
      return new CompiledTemplate(this, container, source);
    }

    return noViewTemplate;
  }

  getVisualFactory(container: IContainer, source: ITemplateSource): IVisualFactory {
    if (!source) {
      return null;
    }

    let found = this.factoryLookup.get(source);

    if (!found) {
      found = this.factoryFromCompiledSource(container, source);
      this.factoryLookup.set(source, found);
    }

    return found;
  }

  private factoryFromCompiledSource(container: IContainer, source: ITemplateSource): IVisualFactory {
    const template = this.templateFromCompiledSource(container, source);

    const CompiledVisual = class extends Visual {
      static template: ITemplate = template;
      static source: ITemplateSource = source;

      $slots: Record<string, IEmulatedShadowSlot> = source.hasSlots ? {} : null;

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

  createVisualFromComponent(container: ITemplateContainer, componentOrType: any, instruction: IHydrateElementInstruction): VisualWithCentralComponent {
    let animator = this.animator;
    
    class ComponentVisual extends Visual {
      static template: ITemplate = Object.assign({}, noViewTemplate, { container });
      static source: ITemplateSource = null;

      public component: IElementComponent;

      constructor() {
        super(null, animator);
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

class CompiledTemplate implements ITemplate {
  private createView: () => IView;
  container: ITemplateContainer;

  constructor(templateEngine: ITemplateEngine, container: IContainer, private source: ITemplateSource) {
    this.container = createTemplateContainer(templateEngine, container, source.dependencies);
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
