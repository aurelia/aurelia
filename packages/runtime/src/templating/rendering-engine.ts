import { all, DI, IContainer, Immutable, inject, PLATFORM, Reporter } from '@aurelia/kernel';
import { IChangeSet } from '../binding/change-set';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { IObserverLocator } from '../binding/observer-locator';
import { IResourceDescriptions, IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { ITemplateSource, TemplateDefinition } from './instructions';
import { ExposedContext, IRenderContext } from './render-context';
import { IRenderer, Renderer } from './renderer';
import { RuntimeBehavior } from './runtime-behavior';
import { CompiledTemplate, ITemplate, noViewTemplate } from './template';
import { ITemplateCompiler } from './template-compiler';
import { IViewFactory, ViewFactory } from './view';
import { ViewCompileFlags } from './view-compile-flags';

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
  getViewFactory(source: Immutable<ITemplateSource>, parentContext?: IRenderContext): IViewFactory;

  applyRuntimeBehavior(type: ICustomAttributeType, instance: ICustomAttribute): void;
  applyRuntimeBehavior(type: ICustomElementType, instance: ICustomElement): void;

  createRenderer(context: IRenderContext): IRenderer;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

const defaultCompilerName = 'default';

@inject(IContainer, IChangeSet, IObserverLocator, IEventManager, IExpressionParser, all(ITemplateCompiler))
/*@internal*/
export class RenderingEngine implements IRenderingEngine {
  private templateLookup: Map<TemplateDefinition, ITemplate> = new Map();
  private factoryLookup: Map<Immutable<ITemplateSource>, IViewFactory> = new Map();
  private behaviorLookup: Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior> = new Map();
  private compilers: Record<string, ITemplateCompiler>;

  constructor(
    private container: IContainer,
    private changeSet: IChangeSet,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
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

  public getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate {
    if (!definition) {
      return null;
    }

    let found = this.templateLookup.get(definition);

    if (!found) {
      found = this.templateFromSource(definition);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.renderContext !== null && componentType) {
        componentType.register(<ExposedContext>found.renderContext);
      }

      this.templateLookup.set(definition, found);
    }

    return found;
  }

  public getViewFactory(definition: Immutable<ITemplateSource>, parentContext?: IRenderContext): IViewFactory {
    if (!definition) {
      return null;
    }

    let found = this.factoryLookup.get(definition);

    if (!found) {
      const validSource = createDefinition(definition);
      found = this.factoryFromSource(validSource, parentContext);
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

  public createRenderer(context: IRenderContext): IRenderer {
    return new Renderer(
      context,
      this.observerLocator,
      this.eventManager,
      this.parser,
      this
    );
  }

  private factoryFromSource(definition: TemplateDefinition, parentContext?: IRenderContext): IViewFactory {
    const template = this.templateFromSource(definition, parentContext);
    const factory = new ViewFactory(definition.name, template);
    factory.setCacheSize(definition.cache, true);
    return factory;
  }

  private templateFromSource(definition: TemplateDefinition, parentContext?: IRenderContext): ITemplate {
    parentContext = parentContext || <ExposedContext>this.container;

    if (definition && definition.templateOrNode) {
      if (definition.build.required) {
        const compilerName = definition.build.compiler || defaultCompilerName;
        const compiler = this.compilers[compilerName];

        if (!compiler) {
          throw Reporter.error(20, compilerName);
        }

        definition = compiler.compile(<ITemplateSource>definition, new RuntimeCompilationResources(<ExposedContext>parentContext), ViewCompileFlags.surrogate);
      }

      return new CompiledTemplate(this, parentContext, definition);
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
    instructions: definition.instructions ? PLATFORM.toArray(definition.instructions) : PLATFORM.emptyArray,
    dependencies: definition.dependencies ? PLATFORM.toArray(definition.dependencies) : PLATFORM.emptyArray,
    surrogates: definition.surrogates ? PLATFORM.toArray(definition.surrogates) : PLATFORM.emptyArray,
    containerless: definition.containerless || false,
    shadowOptions: definition.shadowOptions || null,
    hasSlots: definition.hasSlots || false
  };
}

/*@internal*/
export class RuntimeCompilationResources implements IResourceDescriptions {
  constructor(private context: ExposedContext) {}

  public find<TSource>(kind: IResourceKind<TSource>, name: string): ResourceDescription<TSource> | null {
    const key = kind.keyFrom(name);
    const resolver = this.context.getResolver<TSource>(key, false);

    if (resolver !== null && resolver.getFactory) {
      const factory = resolver.getFactory(this.context);

      if (factory !== null) {
        return (factory.type as IResourceType<TSource>).description || null;
      }
    }

    return null;
  }

  public create<TSource, TType extends IResourceType<TSource>>(kind: IResourceKind<TSource, TType>, name: string): InstanceType<TType> | null {
    const key = kind.keyFrom(name);
    if (this.context.has(key, false)) {
      return this.context.get(key) || null;
    }
    return null;
  }
}
