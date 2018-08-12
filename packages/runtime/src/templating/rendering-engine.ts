import { all, Constructable, DI, IContainer, Immutable, inject, PLATFORM, Reporter } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingFlags } from '../binding/binding-flags';
import { IChangeSet } from '../binding/change-set';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { IBindScope } from '../binding/observation';
import { IObserverLocator } from '../binding/observer-locator';
import { DOM, INode, INodeSequence, NodeSequence } from '../dom';
import { IResourceDescriptions, IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { IAnimator } from './animator';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { BindableDefinitions, IHydrateElementInstruction, ITemplateSource, TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { AttachLifecycle, DetachLifecycle, IAttach } from './lifecycle';
import { createRenderContext, ExposedContext, IRenderContext } from './render-context';
import { IRenderable } from './renderable';
import { IRenderer, Renderer } from './renderer';
import { IRuntimeBehavior, RuntimeBehavior } from './runtime-behavior';
import { ITemplate } from './template';
import { ITemplateCompiler } from './template-compiler';
import { IView, IViewFactory, MotionDirection, RenderCallback, ViewWithCentralComponent } from './view';
import { IViewSlot } from './view-slot';

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType: ICustomElementType): ITemplate;
  getViewFactory(context: IRenderContext, source: Immutable<ITemplateSource>): IViewFactory;

  applyRuntimeBehavior(type: ICustomAttributeType, instance: ICustomAttribute, bindables: BindableDefinitions): IRuntimeBehavior;
  applyRuntimeBehavior(type: ICustomElementType, instance: ICustomElement, bindables: BindableDefinitions): IRuntimeBehavior

  createViewFromComponent(context: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): ViewWithCentralComponent;
  createRenderer(context: IRenderContext): IRenderer;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
const noViewTemplate: ITemplate = {
  renderContext: null,
  createFor(renderable: IRenderable) {
    return NodeSequence.empty;
  }
};

@inject(IContainer, IChangeSet, IObserverLocator, IEventManager, IExpressionParser, IAnimator, all(ITemplateCompiler))
/*@internal*/
export class RenderingEngine implements IRenderingEngine {
  private templateLookup = new Map<TemplateDefinition, ITemplate>();
  private factoryLookup = new Map<Immutable<ITemplateSource>, IViewFactory>();
  private behaviorLookup = new Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior>();
  private compilers: Record<string, ITemplateCompiler>;

  constructor(
    private container: IContainer,
    private changeSet: IChangeSet,
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

  public getViewFactory(context: IRenderContext, definition: Immutable<ITemplateSource>): IViewFactory {
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
      found.applyToElement(this.changeSet, instance);
    } else {
      found.applyToAttribute(this.changeSet, instance);
    }

    return found;
  }

  public createViewFromComponent(context: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): ViewWithCentralComponent {
    const animator = this.animator;

    class ComponentView extends View {
      public component: ICustomElement;

      constructor() {
        super(null, animator);
        this.$context = context;
      }

      public render(): INodeSequence {
        let target: INode;

        if (typeof componentOrType === 'function') {
          target = DOM.createElement(componentOrType.source.name);
          context.hydrateElement(this, target, instruction);
          this.component = <ICustomElement>this.$attachables[this.$attachables.length - 1];
        } else {
          const componentType = <ICustomElementType>componentOrType.constructor;
          target = componentOrType.element || DOM.createElement(componentType.description.name);
          context.hydrateElementInstance(this, target, instruction, componentOrType);
          this.component = componentOrType;
        }

        return NodeSequence.fromNode(target);
      }

      public tryReturnToCache(): false {
        return false;
      }
    }

    return new ComponentView();
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

  private factoryFromSource(context: IRenderContext, definition: TemplateDefinition): IViewFactory {
    const template = this.templateFromSource(context, definition);

    const CompiledView = class extends View {
      $context = context;

      public render(): INodeSequence {
        return template.createFor(this);
      }
    }

    const factory = new ViewFactory(definition.name, CompiledView);
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
  private createNodeSequence: () => INodeSequence;
  public renderContext: IRenderContext;

  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
    this.createNodeSequence = DOM.createFactoryFromMarkupOrNode(templateDefinition.templateOrNode);
  }

  public createFor(renderable: IRenderable, host?: INode, replacements?: TemplatePartDefinitions): INodeSequence {
    const nodes = this.createNodeSequence();
    this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, replacements);
    return nodes;
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
export abstract class View implements IView {
  public $bindables: IBindScope[] = [];
  public $attachables: IAttach[] = [];
  public $scope: IScope = null;
  public $nodes: INodeSequence = null;
  public $isBound: boolean = false;
  public $isAttached: boolean = false;
  public $context: IRenderContext;
  public parent: IViewSlot;
  public onRender: RenderCallback;
  public renderState: any;
  public inCache: boolean = false;

  private animationRoot: INode;

  constructor(public factory: ViewFactory, private animator: IAnimator) {
    this.$nodes = this.render();
  }

  public abstract render(): INodeSequence;

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

  public $bind(flags: BindingFlags, scope: IScope): void {
    if (this.$isBound) {
      if (this.$scope === scope) {
        return;
      }

      this.$unbind(flags);
    }

    this.$scope = scope;

    const bindables = this.$bindables;

    for (let i = 0, ii = bindables.length; i < ii; ++i) {
      bindables[i].$bind(flags, scope);
    }

    this.$isBound = true;
  }

  public $attach(encapsulationSource: INode, lifecycle?: AttachLifecycle): void {
    if (this.$isAttached) {
      return;
    }

    lifecycle = AttachLifecycle.start(this, lifecycle);

    const attachables = this.$attachables;

    for (let i = 0, ii = attachables.length; i < ii; ++i) {
      attachables[i].$attach(encapsulationSource, lifecycle);
    }

    this.onRender(this);
    this.$isAttached = true;
    lifecycle.end(this);
  }

  public $detach(lifecycle?: DetachLifecycle): void {
    if (this.$isAttached) {
      lifecycle = DetachLifecycle.start(this, lifecycle);
      lifecycle.queueViewRemoval(this);

      const attachables = this.$attachables;
      let i = attachables.length;

      while (i--) {
        attachables[i].$detach(lifecycle);
      }

      this.$isAttached = false;
      lifecycle.end(this);
    }
  }

  public $unbind(flags: BindingFlags): void {
    if (this.$isBound) {
      const bindables = this.$bindables;
      let i = bindables.length;

      while (i--) {
        bindables[i].$unbind(flags);
      }

      this.$isBound = false;
      this.$scope = null;
    }
  }

  public tryReturnToCache(): boolean {
    return this.factory.tryReturnToCache(this);
  }

  private getAnimationRoot(): INode {
    if (this.animationRoot !== undefined) {
      return this.animationRoot;
    }

    let currentChild = this.$nodes.firstChild;
    const lastChild = this.$nodes.lastChild;
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
}

/*@internal*/
export class ViewFactory implements IViewFactory {
  public isCaching: boolean = false;

  private cacheSize: number = -1;
  private cache: View[] = null;

  constructor(public name: string, private type: Constructable<View>) {}

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

  public tryReturnToCache(view: View): boolean {
    if (this.cache !== null && this.cache.length < this.cacheSize) {
      view.inCache = true;
      this.cache.push(view);
      return true;
    }

    return false;
  }

  public create(): View {
    const cache = this.cache;

    if (cache !== null && cache.length > 0) {
      const view = cache.pop();
      view.inCache = false;
      return view;
    }

    return new this.type(this);
  }
}
