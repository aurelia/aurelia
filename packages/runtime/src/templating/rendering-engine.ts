import { all, Constructable, DI, IContainer, Immutable, inject, PLATFORM, Reporter } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { IBindScope } from '../binding/observation';
import { IObserverLocator } from '../binding/observer-locator';
import { DOM, INode, IView } from '../dom';
import { IResourceDescriptions, IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { ITaskQueue } from '../task-queue';
import { IAnimator } from './animator';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { BindableDefinitions, IHydrateElementInstruction, ITemplateSource, TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { AttachLifecycle, DetachLifecycle, IAttach } from './lifecycle';
import { createRenderContext, IComponentOperation, IRenderContext, ExposedContext } from './render-context';
import { IRenderSlot } from './render-slot';
import { IRenderer, Renderer } from './renderer';
import { IRuntimeBehavior, RuntimeBehavior } from './runtime-behavior';
import { ITemplate } from './template';
import { ITemplateCompiler } from './template-compiler';
import { IViewOwner, View } from './view';
import { IVisual, IVisualFactory, MotionDirection, RenderCallback, VisualWithCentralComponent } from './visual';

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType: ICustomElementType): ITemplate;
  getVisualFactory(context: IRenderContext, source: Immutable<ITemplateSource>): IVisualFactory;

  applyRuntimeBehavior(type: ICustomAttributeType, instance: ICustomAttribute, bindables: BindableDefinitions): IRuntimeBehavior;
  applyRuntimeBehavior(type: ICustomElementType, instance: ICustomElement, bindables: BindableDefinitions): IRuntimeBehavior

  createVisualFromComponent(context: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): VisualWithCentralComponent;
  createRenderer(context: IRenderContext): IRenderer;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

// This is an implementation of ITemplate that always returns a view representing "no DOM" to render.
const noViewTemplate: ITemplate = {
  renderContext: null,
  createFor(owner: IViewOwner) {
    return View.none;
  }
};

@inject(IContainer, ITaskQueue, IObserverLocator, IEventManager, IExpressionParser, IAnimator, all(ITemplateCompiler))
/*@internal*/
export class RenderingEngine implements IRenderingEngine {
  private templateLookup = new Map<TemplateDefinition, ITemplate>();
  private factoryLookup = new Map<Immutable<ITemplateSource>, IVisualFactory>();
  private behaviorLookup = new Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior>();
  private compilers: Record<string, ITemplateCompiler>;

  constructor(
    private container: IContainer,
    private taskQueue: ITaskQueue,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private animator: IAnimator,
    templateCompilers: ITemplateCompiler[]
  ) {
    this.compilers = templateCompilers.reduce((acc, item) => {
      acc[item.name] = item;
      return acc;
    }, Object.create(null));
  }

  public getElementTemplate(definition: TemplateDefinition, componentType: ICustomElementType): ITemplate {
    if (!definition) {
      return null;
    }

    let found = this.templateLookup.get(definition);

    if (!found) {
      found = this.templateFromSource(<ExposedContext>this.container, definition);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.renderContext !== null) {
        componentType.register(<ExposedContext>found.renderContext);
      }

      this.templateLookup.set(definition, found);
    }

    return found;
  }

  public getVisualFactory(context: IRenderContext, definition: Immutable<ITemplateSource>): IVisualFactory {
    if (!definition) {
      return null;
    }

    let found = this.factoryLookup.get(definition);

    if (!found) {
      let validSource = createDefinition(definition);
      found = this.factoryFromSource(context, validSource);
      this.factoryLookup.set(definition, found);
    }

    return found;
  }

  public applyRuntimeBehavior(type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement, bindables: BindableDefinitions): IRuntimeBehavior {
    let found = this.behaviorLookup.get(type);

    if (!found) {
      found = RuntimeBehavior.create(instance, bindables, type);
      this.behaviorLookup.set(type, found);
    }

    if ('$projector' in instance) {
      found.applyToElement(this.taskQueue, instance);
    } else {
      found.applyToAttribute(this.taskQueue, instance);
    }

    return found;
  }

  public createVisualFromComponent(context: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): VisualWithCentralComponent {
    let animator = this.animator;

    class ComponentVisual extends Visual {
      public component: ICustomElement;

      constructor() {
        super(null, animator);
        this.$context = context;
      }

      createView() {
        let target: INode;

        if (typeof componentOrType === 'function') {
          target = DOM.createElement(componentOrType.source.name);
          context.hydrateElement(this, target, instruction);
          this.component = <ICustomElement>this.$attachable[this.$attachable.length - 1];
        } else {
          const componentType = <ICustomElementType>componentOrType.constructor;
          target = componentOrType.element || DOM.createElement(componentType.description.name);
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

  public createRenderer(context: IRenderContext): IRenderer {
    return new Renderer(
      context,
      this.observerLocator,
      this.eventManager,
      this.parser,
      this
    );
  }

  private factoryFromSource(context: IRenderContext, definition: TemplateDefinition): IVisualFactory {
    const template = this.templateFromSource(context, definition);

    const CompiledVisual = class extends Visual {
      $context = context;

      createView() {
        return template.createFor(this);
      }
    }

    let factory = new VisualFactory(definition.name, CompiledVisual);
    factory.setCacheSize(definition.cache, true);
    return factory;
  }

  private templateFromSource(context: IRenderContext, definition: TemplateDefinition): ITemplate {
    if (definition && definition.templateOrNode) {
      if (definition.build.required) {
        const compiler = this.compilers[definition.build.compiler];

        if (!compiler) {
          throw Reporter.error(20, `Requested Compiler: ${compiler.name}`);
        }

        definition = compiler.compile(definition, new RuntimeCompilationResources(<ExposedContext>context));
      }

      return new CompiledTemplate(this, context, definition);
    }

    return noViewTemplate;
  }
}

/*@internal*/
export function createDefinition(definition: Immutable<ITemplateSource>): TemplateDefinition {
  return {
    name: definition.name || 'Unnamed Template',
    templateOrNode: definition.templateOrNode,
    cache: definition.cache || 0,
    build: definition.build || {
      required: false,
      compiler: 'default'
    },
    bindables: definition.bindables || PLATFORM.emptyObject,
    instructions: definition.instructions ? Array.from(definition.instructions) : PLATFORM.emptyArray,
    dependencies: definition.dependencies ? Array.from(definition.dependencies) : PLATFORM.emptyArray,
    surrogates: definition.surrogates ? Array.from(definition.surrogates) : PLATFORM.emptyArray,
    containerless: definition.containerless || false,
    shadowOptions: definition.shadowOptions || null,
    hasSlots: definition.hasSlots || false
  };
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/*@internal*/
export class CompiledTemplate implements ITemplate {
  private createView: () => IView;
  public renderContext: IRenderContext;

  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
    this.createView = DOM.createFactoryFromMarkupOrNode(templateDefinition.templateOrNode);
  }

  public createFor(owner: IViewOwner, host?: INode, replacements?: TemplatePartDefinitions): IView {
    const view = this.createView();
    this.renderContext.render(owner, view.findTargets(), this.templateDefinition, host, replacements);
    return view;
  }
}

/*@internal*/
export class RuntimeCompilationResources implements IResourceDescriptions {
  constructor(private context: ExposedContext) {}

  public get<TSource>(kind: IResourceKind<TSource>, name: string): ResourceDescription<TSource> | null {
    const key = kind.key(name);
    const resolver = this.context.getResolver(key);

    if (resolver !== null && resolver.getFactory) {
      let factory = resolver.getFactory(this.context);

      if (factory !== null) {
        return (factory.type as IResourceType<TSource>).description;
      }
    }

    return null;
  }
}

/*@internal*/
export abstract class Visual implements IVisual {
  public $bindable: IBindScope[] = [];
  public $attachable: IAttach[] = [];
  public $scope: IScope = null;
  public $view: IView = null;
  public $isBound = false;
  public $isAttached = false;
  public $context: IRenderContext;
  public parent: IRenderSlot;
  public onRender: RenderCallback;
  public renderState: any;

  public inCache = false;
  private animationRoot: INode = undefined;

  constructor(public factory: VisualFactory, private animator: IAnimator) {
    this.$view = this.createView();
  }

  public abstract createView(): IView;

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

  public animate(direction: MotionDirection = MotionDirection.enter): void | Promise<boolean> {
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

  public $bind(flags: BindingFlags, scope: IScope) {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$scope = scope;

    const bindable = this.$bindable;

    for (let i = 0, ii = bindable.length; i < ii; ++i) {
      bindable[i].$bind(flags, scope);
    }

    this.$isBound = true;
  }

  public $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle) {
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

  public $detach(lifecycle?: DetachLifecycle) {
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

  public $unbind(flags: BindingFlags) {
    if (this.$isBound) {
      const bindable = this.$bindable;
      let i = bindable.length;

      while (i--) {
        bindable[i].$unbind(flags);
      }

      this.$isBound = false;
      this.$scope = null;
    }
  }

  public tryReturnToCache() {
    return this.factory.tryReturnToCache(this);
  }
}

/*@internal*/
export class VisualFactory implements IVisualFactory {
  private cacheSize = -1;
  private cache: Visual[] = null;

  public isCaching = false;

  constructor(public name: string, private type: Constructable<Visual>) {}

  public setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void {
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

  public tryReturnToCache(visual: Visual): boolean {
    if (this.cache !== null && this.cache.length < this.cacheSize) {
      visual.inCache = true;
      this.cache.push(visual);
      return true;
    }

    return false;
  }

  public create(): Visual {
    const cache = this.cache;

    if (cache !== null && cache.length > 0) {
      let visual = cache.pop();
      visual.inCache = false;
      return visual;
    }

    return new this.type(this);
  }
}
