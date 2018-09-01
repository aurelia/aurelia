import { all, DI, IContainer, Immutable, inject, PLATFORM, Reporter } from '@aurelia/kernel';
import { IChangeSet } from '../binding/change-set';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { IObserverLocator } from '../binding/observer-locator';
import { DOM, INode, INodeSequence, NodeSequence } from '../dom';
import { IResourceDescriptions, IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { IAnimator } from './animator';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { IHydrateElementInstruction, ITemplateSource, TemplateDefinition, TemplatePartDefinitions } from './instructions';
import { createRenderContext, ExposedContext, IRenderContext } from './render-context';
import { IRenderable } from './renderable';
import { IRenderer, Renderer } from './renderer';
import { RuntimeBehavior } from './runtime-behavior';
import { ITemplate } from './template';
import { ITemplateCompiler } from './template-compiler';
import { IViewFactory, View, ViewFactory, ViewWithCentralComponent } from './view';
import { ViewCompileFlags } from './view-compile-flags';

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType: ICustomElementType): ITemplate;
  getViewFactory(context: IRenderContext, source: Immutable<ITemplateSource>): IViewFactory;

  applyRuntimeBehavior(type: ICustomAttributeType, instance: ICustomAttribute): void;
  applyRuntimeBehavior(type: ICustomElementType, instance: ICustomElement): void

  createViewFromComponent(context: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): ViewWithCentralComponent;
  createRenderer(context: IRenderContext): IRenderer;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
const noViewTemplate: ITemplate = {
  renderContext: null,
  createFor(renderable: IRenderable): INodeSequence {
    return NodeSequence.empty;
  }
};

const defaultCompilerName = 'default';

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
    this.compilers = templateCompilers.reduce(
      (acc, item) => {
        acc[item.name] = item;
        return acc;
      },
      Object.create(null)
    );
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
      const validSource = createDefinition(definition);
      found = this.factoryFromSource(context, validSource);
      this.factoryLookup.set(definition, found);
    }

    return found;
  }

  public applyRuntimeBehavior(type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void {
    let found = this.behaviorLookup.get(type);

    if (!found) {
      found = RuntimeBehavior.create(type, instance);
      this.behaviorLookup.set(type, found);
    }

    found.applyTo(instance, this.changeSet);
  }

  public createViewFromComponent(context: IRenderContext, componentOrType: any, instruction: Immutable<IHydrateElementInstruction>): ViewWithCentralComponent {
    const animator = this.animator;

    class ComponentView extends View {
      public component: ICustomElement;

      constructor() {
        super(null, null, animator);
        this.$context = context;
      }

      public createNodes(): INodeSequence {
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
    const factory = new ViewFactory(definition.name, template, this.animator);
    factory.setCacheSize(definition.cache, true);
    return factory;
  }

  private templateFromSource(context: IRenderContext, definition: TemplateDefinition): ITemplate {
    if (definition && definition.templateOrNode) {
      if (definition.build.required) {
        const compilerName = definition.build.compiler || defaultCompilerName;
        const compiler = this.compilers[compilerName];

        if (!compiler) {
          throw Reporter.error(20, compilerName);
        }

        definition = compiler.compile(definition, new RuntimeCompilationResources(<ExposedContext>context), ViewCompileFlags.surrogate);
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
      required: false
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
  public renderContext: IRenderContext;
  private createNodeSequence: () => INodeSequence;

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

  public find<TSource>(kind: IResourceKind<TSource>, name: string): ResourceDescription<TSource> | null {
    const key = kind.keyFrom(name);
    const resolver = this.context.getResolver(key);

    if (resolver !== null && resolver.getFactory) {
      const factory = resolver.getFactory(this.context);

      if (factory !== null) {
        return (factory.type as IResourceType<TSource>).description;
      }
    }

    return null;
  }
}
