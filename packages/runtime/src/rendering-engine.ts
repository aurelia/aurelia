import {
  all,
  DI,
  IContainer,
  IDisposable,
  IIndexable,
  Immutable,
  ImmutableArray,
  InterfaceSymbol,
  IRegistry,
  IResolver,
  IResourceDescriptions,
  IServiceLocator,
  PLATFORM,
  Reporter,
  RuntimeCompilationResources,
  Writable
} from '@aurelia/kernel';
import {
  BindableDefinitions,
  buildTemplateDefinition,
  customElementBehavior,
  IBindableDescription,
  InstructionTypeName,
  ITargetedInstruction,
  ITemplateDefinition,
  TemplateDefinition,
  TemplatePartDefinitions
} from './definitions';
import { IDOM, INode, INodeSequenceFactory, IRenderLocation, NodeSequence } from './dom';
import { LifecycleFlags } from './flags';
import {
  ILifecycle,
  IRenderable,
  IRenderContext,
  IViewFactory
} from './lifecycle';
import {
  IAccessor,
  IPropertySubscriber,
  ISubscribable,
  ISubscriberCollection,
  MutationKind
} from './observation';
import { ProxyObserver } from './observation/proxy-observer';
import { SelfObserver } from './observation/self-observer';
import { subscriberCollection } from './observation/subscriber-collection';
import { ICustomAttribute, ICustomAttributeType } from './resources/custom-attribute';
import { ICustomElement, ICustomElementType } from './resources/custom-element';
import { ViewFactory } from './templating/view';

export interface ITemplateCompiler {
  readonly name: string;
  compile(dom: IDOM, definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>('ITemplateCompiler').noDefault();

export enum ViewCompileFlags {
  none        = 0b0_001,
  surrogate   = 0b0_010,
  shadowDOM   = 0b0_100,
}

export interface ITemplateFactory<T extends INode = INode> {
  create(parentRenderContext: IRenderContext<T>, definition: TemplateDefinition): ITemplate<T>;
}

export const ITemplateFactory = DI.createInterface<ITemplateFactory>('ITemplateFactory').noDefault();

// The basic template abstraction that allows consumers to create
// instances of an INodeSequence on-demand. Templates are contextual in that they are, in the very least,
// part of a particular application, with application-level resources, but they also may have their
// own scoped resources or be part of another view (via a template controller) which provides a
// context for the template.
export interface ITemplate<T extends INode = INode> {
  readonly renderContext: IRenderContext<T>;
  readonly dom: IDOM<T>;
  render(renderable: IRenderable<T>, host?: T, parts?: Immutable<Record<string, ITemplateDefinition>>, flags?: LifecycleFlags): void;
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
export class CompiledTemplate<T extends INode = INode> implements ITemplate {
  public readonly factory: INodeSequenceFactory<T>;
  public readonly renderContext: IRenderContext<T>;
  public readonly dom: IDOM<T>;

  private readonly definition: TemplateDefinition;

  constructor(dom: IDOM<T>, definition: TemplateDefinition, factory: INodeSequenceFactory<T>, renderContext: IRenderContext<T>) {
    this.dom = dom;
    this.definition = definition;
    this.factory = factory;
    this.renderContext = renderContext;
  }

  public render(renderable: IRenderable<T>, host?: T, parts?: TemplatePartDefinitions, flags: LifecycleFlags = LifecycleFlags.none): void {
    const nodes = (renderable as Writable<IRenderable>).$nodes = this.factory.createNodeSequence();
    (renderable as Writable<IRenderable>).$context = this.renderContext;
    flags |= this.definition.strategy;
    this.renderContext.render(flags, renderable, nodes.findTargets(), this.definition, host, parts);
  }
}

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/** @internal */
export const noViewTemplate: ITemplate = {
  renderContext: null,
  dom: null,
  render(renderable: IRenderable): void {
    (renderable as Writable<IRenderable>).$nodes = NodeSequence.empty;
    (renderable as Writable<IRenderable>).$context = null;
  }
};

const defaultCompilerName = 'default';

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}

export interface IInstructionRenderer<TType extends InstructionTypeName = InstructionTypeName> extends Partial<IInstructionTypeClassifier<TType>> {
  render(flags: LifecycleFlags, dom: IDOM, context: IRenderContext, renderable: IRenderable, target: unknown, instruction: ITargetedInstruction, ...rest: unknown[]): void;
}

export const IInstructionRenderer = DI.createInterface<IInstructionRenderer>('IInstructionRenderer').noDefault();

export interface IRenderer {
  instructionRenderers: Record<string, IInstructionRenderer>;
  render(
    flags: LifecycleFlags,
    dom: IDOM,
    context: IRenderContext,
    renderable: IRenderable,
    targets: ArrayLike<INode>,
    templateDefinition: TemplateDefinition,
    host?: INode,
    parts?: TemplatePartDefinitions
  ): void;
}

export const IRenderer = DI.createInterface<IRenderer>('IRenderer').noDefault();

export interface IRenderingEngine {
  getElementTemplate<T extends INode = INode>(
    dom: IDOM<T>,
    definition: TemplateDefinition,
    parentContext: IServiceLocator,
    componentType: ICustomElementType<T> | null
  ): ITemplate<T>;

  getViewFactory<T extends INode = INode>(
    dom: IDOM<T>,
    source: Immutable<ITemplateDefinition>,
    parentContext: IRenderContext<T> | null
  ): IViewFactory<T>;

  applyRuntimeBehavior<T extends INode = INode>(flags: LifecycleFlags, Type: ICustomAttributeType<T>, instance: ICustomAttribute<T>): void;
  applyRuntimeBehavior<T extends INode = INode>(flags: LifecycleFlags, Type: ICustomElementType<T>, instance: ICustomElement<T>): void;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));

/** @internal */
export class RenderingEngine implements IRenderingEngine {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [IContainer, ITemplateFactory, ILifecycle, all(ITemplateCompiler)];

  private readonly behaviorLookup: Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior>;
  private readonly compilers: Record<string, ITemplateCompiler>;
  private readonly container: IContainer;
  private readonly templateFactory: ITemplateFactory;
  private readonly viewFactoryLookup: Map<Immutable<ITemplateDefinition>, IViewFactory>;
  private readonly lifecycle: ILifecycle;
  private readonly templateLookup: Map<TemplateDefinition, ITemplate>;

  constructor(container: IContainer, templateFactory: ITemplateFactory, lifecycle: ILifecycle, templateCompilers: ITemplateCompiler[]) {
    this.behaviorLookup = new Map();
    this.container = container;
    this.templateFactory = templateFactory;
    this.viewFactoryLookup = new Map();
    this.lifecycle = lifecycle;
    this.templateLookup = new Map();

    this.compilers = templateCompilers.reduce(
      (acc, item) => {
        acc[item.name] = item;
        return acc;
      },
      Object.create(null)
    );
  }

  public getElementTemplate<T extends INode = INode>(
    dom: IDOM<T>,
    definition: TemplateDefinition,
    parentContext: IRenderContext<T> | null,
    componentType: ICustomElementType<T> | null
  ): ITemplate<T> {
    if (!definition) {
      return null;
    }

    let found = this.templateLookup.get(definition);

    if (!found) {
      found = this.templateFromSource(dom, definition, parentContext, componentType);

      this.templateLookup.set(definition, found);
    }

    return found as ITemplate<T>;
  }

  public getViewFactory<T extends INode = INode>(
    dom: IDOM<T>,
    definition: Immutable<ITemplateDefinition>,
    parentContext: IRenderContext<T> | null
  ): IViewFactory<T> {
    if (!definition) {
      return null;
    }

    let factory = this.viewFactoryLookup.get(definition);

    if (!factory) {
      const validSource = buildTemplateDefinition(null, definition);
      const template = this.templateFromSource(dom, validSource, parentContext, null);
      factory = new ViewFactory(validSource.name, template, this.lifecycle);
      factory.setCacheSize(validSource.cache, true);
      this.viewFactoryLookup.set(definition, factory);
    }

    return factory as IViewFactory<T>;
  }

  public applyRuntimeBehavior(flags: LifecycleFlags, Type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void {
    let found = this.behaviorLookup.get(Type);

    if (!found) {
      found = RuntimeBehavior.create(Type);
      this.behaviorLookup.set(Type, found);
    }

    found.applyTo(flags, instance, this.lifecycle);
  }

  private templateFromSource(
    dom: IDOM,
    definition: TemplateDefinition,
    parentContext: IRenderContext | null,
    componentType: ICustomElementType | null
  ): ITemplate {
    if (parentContext === null) {
      parentContext = this.container as ExposedContext;
    }

    if (definition.template !== null) {
      const renderContext = createRenderContext(dom, parentContext, definition.dependencies, componentType) as ExposedContext;

      if (definition.build.required) {
        const compilerName = definition.build.compiler || defaultCompilerName;
        const compiler = this.compilers[compilerName];

        if (compiler === undefined) {
          throw Reporter.error(20, compilerName);
        }

        definition = compiler.compile(dom, definition as ITemplateDefinition, new RuntimeCompilationResources(renderContext), ViewCompileFlags.surrogate);
      }

      return this.templateFactory.create(renderContext, definition);
    }

    return noViewTemplate;
  }
}

export function createRenderContext(
  dom: IDOM,
  parentRenderContext: IRenderContext,
  dependencies: ImmutableArray<IRegistry>,
  componentType: ICustomElementType | null
): IRenderContext {
  const context = parentRenderContext.createChild() as ExposedContext;
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider();
  const renderLocationProvider = new InstanceProvider<IRenderLocation>();
  const renderer = context.get(IRenderer);

  dom.registerElementResolver(context, elementProvider);

  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IRenderable, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IRenderLocation, renderLocationProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  //If the element has a view, support Recursive Components by adding self to own view template container.
  if (componentType) {
    componentType.register(context);
  }

  context.render = function(this: IRenderContext, flags: LifecycleFlags, renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    renderer.render(flags, dom, this, renderable, targets, templateDefinition, host, parts);
  };

  context.beginComponentOperation = function(renderable: IRenderable, target: INode, instruction: ITargetedInstruction, factory: IViewFactory | null, parts?: TemplatePartDefinitions, location?: IRenderLocation): IDisposable {
    renderableProvider.prepare(renderable);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);

    if (factory) {
      factoryProvider.prepare(factory, parts);
    }

    if (location) {
      renderLocationProvider.prepare(location);
    }

    return context;
  };

  context.dispose = function(): void {
    factoryProvider.dispose();
    renderableProvider.dispose();
    instructionProvider.dispose();
    elementProvider.dispose();
    renderLocationProvider.dispose();
  };

  return context;
}

/** @internal */
export class InstanceProvider<T> implements IResolver {
  private instance: T | null;

  constructor() {
    this.instance = null;
  }

  public prepare(instance: T): void {
    this.instance = instance;
  }

  public resolve(handler: IContainer, requestor: IContainer): T | null {
    if (this.instance === undefined) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    return this.instance;
  }

  public dispose(): void {
    this.instance = null;
  }
}

/** @internal */
export class ViewFactoryProvider implements IResolver {
  private factory: IViewFactory | null;
  private replacements: TemplatePartDefinitions;

  public prepare(factory: IViewFactory, parts: TemplatePartDefinitions): void {
    this.factory = factory;
    this.replacements = parts || PLATFORM.emptyObject;
  }

  public resolve(handler: IContainer, requestor: ExposedContext): IViewFactory {
    const factory = this.factory;
    if (factory === undefined || factory === null) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
      throw Reporter.error(51); // TODO: organize error codes
    }
    const found = this.replacements[factory.name];
    if (found) {
      const renderingEngine = handler.get(IRenderingEngine);
      const dom = handler.get(IDOM);
      return renderingEngine.getViewFactory(dom, found, requestor);
    }

    return factory;
  }

  public dispose(): void {
    this.factory = null;
    this.replacements = PLATFORM.emptyObject;
  }
}

export interface IChildrenObserver extends
  IAccessor,
  ISubscribable<MutationKind.instance>,
  ISubscriberCollection<MutationKind.instance> { }

/** @internal */
@subscriberCollection(MutationKind.instance)
export class ChildrenObserver implements Partial<IChildrenObserver> {
  public hasChanges: boolean;

  private readonly customElement: ICustomElement & { $childrenChanged?(): void };
  private readonly lifecycle: ILifecycle;
  private children: ICustomElement[];
  private observing: boolean;

  constructor(lifecycle: ILifecycle, customElement: ICustomElement & { $childrenChanged?(): void }) {
    this.hasChanges = false;

    this.children = null;
    this.customElement = customElement;
    this.lifecycle = lifecycle;
    this.observing = false;
  }

  public getValue(): ICustomElement[] {
    if (!this.observing) {
      this.observing = true;
      this.customElement.$projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
      this.children = findElements(this.customElement.$projector.children);
    }

    return this.children;
  }

  public setValue(newValue: unknown): void { /* do nothing */ }

  public flush(this: ChildrenObserver & IChildrenObserver, flags: LifecycleFlags): void {
    this.callSubscribers(this.children, undefined, flags | LifecycleFlags.updateTargetInstance);
    this.hasChanges = false;
  }

  public subscribe(this: ChildrenObserver & IChildrenObserver, subscriber: IPropertySubscriber): void {
    this.addSubscriber(subscriber);
  }

  public unsubscribe(this: ChildrenObserver & IChildrenObserver, subscriber: IPropertySubscriber): void {
    this.removeSubscriber(subscriber);
  }

  private onChildrenChanged(): void {
    this.children = findElements(this.customElement.$projector.children);

    if ('$childrenChanged' in this.customElement) {
      this.customElement.$childrenChanged();
    }

    this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
    this.hasChanges = true;
  }
}

/** @internal */
export function findElements(nodes: ArrayLike<unknown>): ICustomElement[] {
  const components: ICustomElement[] = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const current = nodes[i];
    const component = customElementBehavior(current);

    if (component !== null) {
      components.push(component);
    }
  }

  return components;
}

/** @internal */
export class RuntimeBehavior {
  public bindables: BindableDefinitions;

  private constructor() {}

  public static create(Component: ICustomElementType | ICustomAttributeType): RuntimeBehavior {
    const behavior = new RuntimeBehavior();

    behavior.bindables = Component.description.bindables as Record<string, IBindableDescription>;

    return behavior;
  }

  public applyTo(flags: LifecycleFlags, instance: ICustomAttribute | ICustomElement, lifecycle: ILifecycle): void {
    instance.$lifecycle = lifecycle;
    if ('$projector' in instance) {
      this.applyToElement(flags, lifecycle, instance);
    } else {
      this.applyToCore(flags, instance);
    }
  }

  private applyToElement(flags: LifecycleFlags, lifecycle: ILifecycle, instance: ICustomElement): void {
    const observers = this.applyToCore(flags, instance);

    observers.$children = new ChildrenObserver(lifecycle, instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function(): unknown {
        return this['$observers'].$children.getValue();
      }
    });
  }

  private applyToCore(flags: LifecycleFlags, instance: ICustomAttribute | ICustomElement): IIndexable {
    const observers = {};
    const bindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);

    if (flags & LifecycleFlags.proxyStrategy) {
      for (let i = 0, ii = observableNames.length; i < ii; ++i) {
        const name = observableNames[i];

        observers[name] = new SelfObserver(
          flags,
          ProxyObserver.getOrCreate(instance).proxy,
          name,
          bindables[name].callback
        );
      }
    } else {
      for (let i = 0, ii = observableNames.length; i < ii; ++i) {
        const name = observableNames[i];

        observers[name] = new SelfObserver(
          flags,
          instance,
          name,
          bindables[name].callback
        );

        if (!(flags & LifecycleFlags.patchStrategy)) {
          createGetterSetter(flags, instance, name);
        }
      }

      Reflect.defineProperty(instance, '$observers', {
        enumerable: false,
        value: observers
      });
    }

    return observers;
  }
}

function createGetterSetter(flags: LifecycleFlags, instance: ICustomAttribute | ICustomElement, name: string): void {
  Reflect.defineProperty(instance, name, {
    enumerable: true,
    get: function(): unknown { return this['$observers'][name].getValue(); },
    set: function(value: unknown): void { this['$observers'][name].setValue(value, (flags & LifecycleFlags.persistentBindingFlags) | LifecycleFlags.updateTargetInstance); }
  });
}

/** @internal */
export type ExposedContext = IRenderContext & IDisposable & IContainer;
