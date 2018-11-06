import { all, Constructable, DI, IContainer, IDisposable, IIndexable, Immutable, ImmutableArray, inject, IResolver, IServiceLocator, Omit, PLATFORM, Registration, Reporter, Writable } from '@aurelia/kernel';
import { Interpolation } from '../binding/ast';
import { Binding } from '../binding/binding';
import { Scope } from '../binding/binding-context';
import { BindingMode } from '../binding/binding-mode';
import { Call } from '../binding/call';
import { IEventManager } from '../binding/event-manager';
import { BindingType, IExpressionParser } from '../binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from '../binding/interpolation-binding';
import { LetBinding } from '../binding/let-binding';
import { Listener } from '../binding/listener';
import { IObserverLocator } from '../binding/observer-locator';
import { Observer } from '../binding/property-observation';
import { Ref } from '../binding/ref';
import { subscriberCollection } from '../binding/subscriber-collection';
import { BindableDefinitions, buildTemplateDefinition, customAttributeKey, customElementBehavior, CustomElementConstructor, customElementKey, IAttributeDefinition, ICallBindingInstruction, IHydrateAttributeInstruction, IHydrateElementInstruction, IHydrateTemplateController, IInterpolationInstruction, IIteratorBindingInstruction, ILetElementInstruction, IListenerBindingInstruction, IPropertyBindingInstruction, IRefBindingInstruction, IRenderStrategyInstruction, ISetAttributeInstruction, ISetPropertyInstruction, IStylePropertyBindingInstruction, ITargetedInstruction, ITemplateDefinition, ITextBindingInstruction, TargetedInstructionType, TemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { DOM, INode, INodeSequence, INodeSequenceFactory, IRenderLocation, NodeSequence, NodeSequenceFactory } from '../dom';
import { Hooks, IAttach, IAttachables, IBindables, IBindScope, IBindSelf, ILifecycle, ILifecycleHooks, ILifecycleUnbindAfterDetach, IMountable, IRenderable, IRenderContext, IState, IViewFactory, State } from '../lifecycle';
import { IAccessor, IChangeTracker, IPropertySubscriber, ISubscribable, ISubscriberCollection, LifecycleFlags, MutationKind } from '../observation';
import { IResourceDescriptions, IResourceKind, IResourceType, ResourceDescription } from '../resource';
import { ViewFactory } from './view';

export interface IRenderStrategy<TTarget = any, TInstruction extends IRenderStrategyInstruction = any> {
  render(renderable: IRenderable, target: TTarget, instruction: TInstruction): void;
}

export interface IRenderStrategySource {
  name: string;
}

export type IRenderStrategyType = IResourceType<IRenderStrategySource, IRenderStrategy>;

export function renderStrategy(nameOrSource: string | IRenderStrategySource) {
  return function<T extends Constructable>(target: T) {
    return RenderStrategyResource.define(nameOrSource, target);
  }
}

export const RenderStrategyResource: IResourceKind<IRenderStrategySource, IRenderStrategyType> = {
  name: 'render-strategy',

  keyFrom(name: string): string {
    return `${this.name}:${name}`;
  },

  isType<T extends Constructable>(type: T): type is T & IRenderStrategyType {
    return (type as any).kind === this;
  },

  define<T extends Constructable>(nameOrSource: string | IRenderStrategySource, ctor: T): T & IRenderStrategyType {
    const description = typeof nameOrSource === 'string' ? { name: nameOrSource } : nameOrSource;
    const Type: T & IRenderStrategyType = ctor as any;

    (Type as Writable<IRenderStrategyType>).kind = RenderStrategyResource;
    (Type as Writable<IRenderStrategyType>).description = description;
    Type.register = function(container: IContainer) {
      container.register(Registration.singleton(Type.kind.keyFrom(description.name), Type));
    };

    return Type;
  }
};

export interface ITemplateCompiler {
  readonly name: string;
  compile(definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();

export enum ViewCompileFlags {
  none        = 0b0_001,
  surrogate   = 0b0_010,
  shadowDOM   = 0b0_100,
}

export interface ICustomElementType extends
  IResourceType<ITemplateDefinition, ICustomElement>,
  CustomElementConstructor { }

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;

export interface ICustomElement extends Partial<IChangeTracker>, ILifecycleHooks, ILifecycleRender, IBindSelf, ILifecycleUnbindAfterDetach, IAttach, IMountable, IState, IRenderable {
  readonly $projector: IElementProjector;
  readonly $host: ICustomElementHost;
  $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}

export interface ICustomElementHost extends IRenderLocation {
  $customElement?: ICustomElement;
}

export type ElementDefinition = Immutable<Required<ITemplateDefinition>> | null;

export interface ICustomElementResource extends IResourceKind<ITemplateDefinition, ICustomElementType> {
  behaviorFor(node: INode): ICustomElement | null;
}

export interface IElementProjector {
  readonly host: ICustomElementHost;
  readonly children: ArrayLike<ICustomElementHost>;

  provideEncapsulationSource(parentEncapsulationSource: ICustomElementHost): ICustomElementHost;
  project(nodes: INodeSequence): void;
  take(nodes: INodeSequence): void;

  subscribeToChildrenChange(callback: () => void): void;
}

export interface ICustomAttributeType extends
  IResourceType<IAttributeDefinition, ICustomAttribute>,
  Immutable<Pick<Partial<IAttributeDefinition>, 'bindables'>> { }

type OptionalHooks = ILifecycleHooks & Omit<IRenderable, Exclude<keyof IRenderable, '$mount' | '$unmount'>>;
type RequiredLifecycleProperties = Readonly<Pick<IRenderable, '$scope'>> & IState;

export interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
}

export interface ILifecycleRender {
  /**
   * Only applies to `@customElement`. This hook is not invoked for `@customAttribute`s
   *
   * Called during `$hydrate`, after `this.$scope` and `this.$projector` are set.
   *
   * If this hook is implemented, it will be used instead of `renderingEngine.getElementTemplate`.
   * This allows you to completely override the default rendering behavior.
   *
   * It is the responsibility of the implementer to:
   * - Populate `this.$bindables` with any Bindings, child Views, custom elements and custom attributes
   * - Populate `this.$attachables` with any child Views, custom elements and custom attributes
   * - Populate `this.$nodes` with the nodes that need to be appended to the host
   * - Populate `this.$context` with the RenderContext / Container scoped to this instance
   *
   * @param host The DOM node that declares this custom element
   * @param parts Replaceable parts, if any
   *
   * @returns Either an implementation of `IElementTemplateProvider`, or void
   *
   * @description
   * This is the first "hydrate" lifecycle hook. It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   */
  render?(host: INode, parts: Immutable<Pick<IHydrateElementInstruction, 'parts'>>): IElementTemplateProvider | void;
}

export interface ICustomAttribute extends Partial<IChangeTracker>, IBindScope, ILifecycleUnbindAfterDetach, IAttach, OptionalHooks, RequiredLifecycleProperties {
  $hydrate(renderingEngine: IRenderingEngine): void;
}

/*@internal*/
export function $hydrateAttribute(this: Writable<ICustomAttribute>, renderingEngine: IRenderingEngine): void {
  const Type = this.constructor as ICustomAttributeType;

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
}

/*@internal*/
export function $hydrateElement(this: Writable<ICustomElement>, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  this.$scope = Scope.create(this, null);

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasRender) {
    const result = this.render(host, options.parts);

    if (result && 'getElementTemplate' in result) {
      const template = result.getElementTemplate(renderingEngine, Type);
      template.render(this, host, options.parts);
    }
  } else {
    const template = renderingEngine.getElementTemplate(description, Type);
    template.render(this, host, options.parts);
  }
  this.$host = host;
  this.$projector = determineProjector(this, host, description);

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
}

/*@internal*/
export const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

function determineProjector(
  $customElement: ICustomElement,
  host: ICustomElementHost,
  definition: TemplateDefinition
): IElementProjector {
  if (definition.shadowOptions || definition.hasSlots) {
    if (definition.containerless) {
      throw Reporter.error(21);
    }

    return new ShadowDOMProjector($customElement, host, definition);
  }

  if (definition.containerless) {
    return new ContainerlessProjector($customElement, host);
  }

  return new HostProjector($customElement, host);
}

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
  getViewFactory(source: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;

  applyRuntimeBehavior(Type: ICustomAttributeType, instance: ICustomAttribute): void;
  applyRuntimeBehavior(Type: ICustomElementType, instance: ICustomElement): void;

  createRenderer(context: IRenderContext): IRenderer;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

const defaultCompilerName = 'default';

@inject(IContainer, ILifecycle, IObserverLocator, IEventManager, IExpressionParser, all(ITemplateCompiler))
/*@internal*/
export class RenderingEngine implements IRenderingEngine {
  private templateLookup: Map<TemplateDefinition, ITemplate> = new Map();
  private factoryLookup: Map<Immutable<ITemplateDefinition>, IViewFactory> = new Map();
  private behaviorLookup: Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior> = new Map();
  private compilers: Record<string, ITemplateCompiler>;

  constructor(
    private container: IContainer,
    private lifecycle: ILifecycle,
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

  public getViewFactory(definition: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory {
    if (!definition) {
      return null;
    }

    let factory = this.factoryLookup.get(definition);

    if (!factory) {
      const validSource = buildTemplateDefinition(null, definition)
      const template = this.templateFromSource(validSource, parentContext);
      factory = new ViewFactory(validSource.name, template, this.lifecycle);
      factory.setCacheSize(validSource.cache, true);
      this.factoryLookup.set(definition, factory);
    }

    return factory;
  }

  public applyRuntimeBehavior(Type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void {
    let found = this.behaviorLookup.get(Type);

    if (!found) {
      found = RuntimeBehavior.create(Type, instance);
      this.behaviorLookup.set(Type, found);
    }

    found.applyTo(instance, this.lifecycle);
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

  private templateFromSource(definition: TemplateDefinition, parentContext?: IRenderContext): ITemplate {
    parentContext = parentContext || <ExposedContext>this.container;

    if (definition && definition.template) {
      if (definition.build.required) {
        const compilerName = definition.build.compiler || defaultCompilerName;
        const compiler = this.compilers[compilerName];

        if (!compiler) {
          throw Reporter.error(20, compilerName);
        }

        definition = compiler.compile(<ITemplateDefinition>definition, new RuntimeCompilationResources(<ExposedContext>parentContext), ViewCompileFlags.surrogate);
      }

      return new CompiledTemplate(this, parentContext, definition);
    }

    return noViewTemplate;
  }
}
const childObserverOptions = { childList: true };

/*@internal*/
export class ShadowDOMProjector implements IElementProjector {
  public shadowRoot: ICustomElementHost;

  constructor(
    $customElement: ICustomElement,
    public host: ICustomElementHost,
    definition: TemplateDefinition
  ) {
    this.shadowRoot = DOM.attachShadow(host, definition.shadowOptions || defaultShadowOptions);
    host.$customElement = $customElement;
    this.shadowRoot.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.host.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    DOM.createNodeObserver(this.host, callback, childObserverOptions);
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return this.shadowRoot;
  }

  public project(nodes: INodeSequence): void {
    nodes.appendTo(this.host);
    this.project = PLATFORM.noop;
  }

  public take(nodes: INodeSequence): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are in
    // the ShadowDOM.
  }
}

/*@internal*/
export class ContainerlessProjector implements IElementProjector {
  public host: ICustomElementHost;
  private childNodes: ArrayLike<INode>;

  constructor(private $customElement: ICustomElement, host: ICustomElementHost) {
    if (host.childNodes.length) {
      this.childNodes = PLATFORM.toArray(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = DOM.convertToRenderLocation(host);
    this.host.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.childNodes;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    if (!parentEncapsulationSource) {
      throw Reporter.error(22);
    }

    return parentEncapsulationSource;
  }

  public project(nodes: INodeSequence): void {
    if (this.$customElement.$state & State.needsMount) {
      this.$customElement.$state &= ~State.needsMount;
      nodes.insertBefore(this.host);
    }
  }

  public take(nodes: INodeSequence): void {
    this.$customElement.$state |= State.needsMount;
    nodes.remove();
  }
}

/*@internal*/
export class HostProjector implements IElementProjector {
  private readonly isAppHost: boolean;
  constructor($customElement: ICustomElement, public host: ICustomElementHost) {
    host.$customElement = $customElement;
    this.isAppHost = host.hasOwnProperty('$au');
  }

  get children(): ArrayLike<INode> {
    return PLATFORM.emptyArray;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return parentEncapsulationSource || this.host;
  }

  public project(nodes: INodeSequence): void {
    nodes.appendTo(this.host);
    if (!this.isAppHost) {
      this.project = PLATFORM.noop;
    }
  }

  public take(nodes: INodeSequence): void {
    // No special behavior is required because the host element removal
    // will result in the projected nodes being removed, since they are children.
    if (this.isAppHost) {
      // The only exception to that is the app host, which is not part of a removable node sequence
      nodes.remove();
    }
  }
}

/** @internal */
export class RuntimeBehavior {
  public bindables: BindableDefinitions;

  private constructor() {}

  public static create(Component: ICustomElementType | ICustomAttributeType, instance: ICustomAttribute | ICustomElement): RuntimeBehavior {
    const behavior = new RuntimeBehavior();

    behavior.bindables = Component.description.bindables;

    return behavior;
  }

  public applyTo(instance: ICustomAttribute | ICustomElement, lifecycle: ILifecycle): void {
    instance.$lifecycle = lifecycle;
    if ('$projector' in instance) {
      this.applyToElement(lifecycle, instance);
    } else {
      this.applyToCore(instance);
    }
  }

  private applyToElement(lifecycle: ILifecycle, instance: ICustomElement): void {
    const observers = this.applyToCore(instance);

    observers.$children = new ChildrenObserver(lifecycle, instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function(): unknown {
        return this.$observers.$children.getValue();
      }
    });
  }

  private applyToCore(instance: ICustomAttribute | ICustomElement): IIndexable {
    const observers = {};
    const bindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);

    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];

      observers[name] = new Observer(
        instance,
        name,
        bindables[name].callback
      );

      createGetterSetter(instance, name);
    }

    Reflect.defineProperty(instance, '$observers', {
      enumerable: false,
      value: observers
    });

    return observers;
  }
}

function createGetterSetter(instance: ICustomAttribute | ICustomElement, name: string): void {
  Reflect.defineProperty(instance, name, {
    enumerable: true,
    get: function(): unknown { return this.$observers[name].getValue(); },
    set: function(value: unknown): void { this.$observers[name].setValue(value, LifecycleFlags.updateTargetInstance); }
  });
}

export interface IChildrenObserver extends
  IAccessor,
  ISubscribable<MutationKind.instance>,
  ISubscriberCollection<MutationKind.instance> { }

/*@internal*/
@subscriberCollection(MutationKind.instance)
export class ChildrenObserver implements Partial<IChildrenObserver> {
  public hasChanges: boolean = false;

  private children: ICustomElement[] = null;
  private observing: boolean = false;

  constructor(
    private lifecycle: ILifecycle,
    private customElement: ICustomElement & { $childrenChanged?(): void }
  ) { }

  public getValue(): ICustomElement[] {
    if (!this.observing) {
      this.observing = true;
      this.customElement.$projector.subscribeToChildrenChange(() => this.onChildrenChanged());
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

    this.lifecycle.enqueueFlush(this);
    this.hasChanges = true;
  }
}

/*@internal*/
export function findElements(nodes: ArrayLike<INode>): ICustomElement[] {
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
      return this.context.get<any>(key) || null;
    }
    return null;
  }
}

// The basic template abstraction that allows consumers to create
// instances of an INodeSequence on-demand. Templates are contextual in that they are, in the very least,
// part of a particular application, with application-level resources, but they also may have their
// own scoped resources or be part of another view (via a template controller) which provides a
// context for the template.
export interface ITemplate {
  readonly renderContext: IRenderContext;
  render(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): void;
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/*@internal*/
export class CompiledTemplate implements ITemplate {
  public readonly factory: INodeSequenceFactory;
  public readonly renderContext: IRenderContext;

  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.factory = NodeSequenceFactory.createFor(templateDefinition.template);
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
  }

  public render(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): void {
    const nodes = (<Writable<IRenderable>>renderable).$nodes = this.factory.createNodeSequence();
    (<Writable<IRenderable>>renderable).$context = this.renderContext;
    this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, parts);
  }
}

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/*@internal*/
export const noViewTemplate: ITemplate = {
  renderContext: null,
  render(renderable: IRenderable): void {
    (<Writable<IRenderable>>renderable).$nodes = NodeSequence.empty;
    (<Writable<IRenderable>>renderable).$context = null;
  }
};


/*@internal*/
export type ExposedContext = IRenderContext & IDisposable & IContainer;

export function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<any>): IRenderContext {
  const context = <ExposedContext>parentRenderContext.createChild();
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider(renderingEngine);
  const renderLocationProvider = new InstanceProvider<IRenderLocation>();
  const renderer = renderingEngine.createRenderer(context);

  DOM.registerElementResolver(context, elementProvider);

  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IRenderable, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IRenderLocation, renderLocationProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  context.render = function(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    renderer.render(renderable, targets, templateDefinition, host, parts);
  };

  context.beginComponentOperation = function(renderable: IRenderable, target: INode, instruction: ITargetedInstruction, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation): IDisposable {
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

/*@internal*/
export class InstanceProvider<T> implements IResolver {
  private instance: T = null;

  public prepare(instance: T): void {
    this.instance = instance;
  }

  public resolve(handler: IContainer, requestor: IContainer): T {
    if (this.instance === undefined) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    return this.instance;
  }

  public dispose(): void {
    this.instance = null;
  }
}

/*@internal*/
export class ViewFactoryProvider implements IResolver {
  private factory: IViewFactory;
  private replacements: TemplatePartDefinitions;

  constructor(private renderingEngine: IRenderingEngine) {}

  public prepare(factory: IViewFactory, parts: TemplatePartDefinitions): void {
    this.factory = factory;
    this.replacements = parts || PLATFORM.emptyObject;
  }

  public resolve(handler: IContainer, requestor: ExposedContext): IViewFactory {
    const factory = this.factory;
    if (factory === undefined) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
      throw Reporter.error(51); // TODO: organize error codes
    }
    const found = this.replacements[factory.name];
    if (found) {
      return this.renderingEngine.getViewFactory(found, requestor);
    }

    return this.factory;
  }

  public dispose(): void {
    this.factory = null;
    this.replacements = null;
  }
}

export function addBindable(renderable: IBindables, bindable: IBindScope): void {
  bindable.$prevBind = renderable.$bindableTail;
  bindable.$nextBind = null;
  if (renderable.$bindableTail === null) {
    renderable.$bindableHead = bindable;
  } else {
    renderable.$bindableTail.$nextBind = bindable;
  }
  renderable.$bindableTail = bindable;
}

export function addAttachable(renderable: IAttachables, attachable: IAttach): void {
  attachable.$prevAttach = renderable.$attachableTail;
  attachable.$nextAttach = null;
  if (renderable.$attachableTail === null) {
    renderable.$attachableHead = attachable;
  } else {
    renderable.$attachableTail.$nextAttach = attachable;
  }
  renderable.$attachableTail = attachable;
}

export interface IRenderer {
  render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
  hydrateElementInstance(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void;
}

// tslint:disable:function-name
// tslint:disable:no-any

/* @internal */
export class Renderer implements IRenderer {
  constructor(
    private context: IRenderContext,
    private observerLocator: IObserverLocator,
    private eventManager: IEventManager,
    private parser: IExpressionParser,
    private renderingEngine: IRenderingEngine
  ) { }

  public render(renderable: IRenderable, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    const targetInstructions = definition.instructions;

    if (targets.length !== targetInstructions.length) {
      if (targets.length > targetInstructions.length) {
        throw Reporter.error(30);
      } else {
        throw Reporter.error(31);
      }
    }
    for (let i = 0, ii = targets.length; i < ii; ++i) {
      const instructions = targetInstructions[i];
      const target = targets[i];

      for (let j = 0, jj = instructions.length; j < jj; ++j) {
        const current = instructions[j];
        (this as any)[current.type](renderable, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        (this as any)[current.type](renderable, host, current, parts);
      }
    }
  }

  public hydrateElementInstance(renderable: IRenderable, target: INode, instruction: Immutable<IHydrateElementInstruction>, component: ICustomElement): void {
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine, target, instruction);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      const currentType = current.type;

      (this as any)[currentType](renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);
  }

  public [TargetedInstructionType.textBinding](renderable: IRenderable, target: any, instruction: Immutable<ITextBindingInstruction>): void {
    const next = target.nextSibling;
    DOM.treatAsNonWhitespace(next);
    DOM.remove(target);
    const $from = instruction.from as any;
    const expr = ($from.$kind ? $from : this.parser.parse($from, BindingType.Interpolation)) as Interpolation;
    if (expr.isMulti) {
      addBindable(renderable, new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, this.context));
    } else {
      addBindable(renderable, new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, this.context, true));
    }
  }

  public [TargetedInstructionType.interpolation](renderable: IRenderable, target: any, instruction: Immutable<IInterpolationInstruction>): void {
    const $from = instruction.from as any;
    const expr = ($from.$kind ? $from : this.parser.parse($from, BindingType.Interpolation)) as Interpolation;
    if (expr.isMulti) {
      addBindable(renderable, new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, this.context));
    } else {
      addBindable(renderable, new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, this.context, true));
    }
  }

  public [TargetedInstructionType.propertyBinding](renderable: IRenderable, target: any, instruction: Immutable<IPropertyBindingInstruction>): void {
    const $from = instruction.from as any;
    addBindable(renderable, new Binding($from.$kind ? $from : this.parser.parse($from, BindingType.IsPropertyCommand | instruction.mode), target, instruction.to, instruction.mode, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.iteratorBinding](renderable: IRenderable, target: any, instruction: Immutable<IIteratorBindingInstruction>): void {
    const $from = instruction.from as any;
    addBindable(renderable, new Binding($from.$kind ? $from : this.parser.parse($from, BindingType.ForCommand), target, instruction.to, BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.listenerBinding](renderable: IRenderable, target: any, instruction: Immutable<IListenerBindingInstruction>): void {
    const $from = instruction.from as any;
    addBindable(renderable, new Listener(instruction.to, instruction.strategy, $from.$kind ? $from : this.parser.parse($from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta)), target, instruction.preventDefault, this.eventManager, this.context));
  }

  public [TargetedInstructionType.callBinding](renderable: IRenderable, target: any, instruction: Immutable<ICallBindingInstruction>): void {
    const $from = instruction.from as any;
    addBindable(renderable, new Call($from.$kind ? $from : this.parser.parse($from, BindingType.CallCommand), target, instruction.to, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.refBinding](renderable: IRenderable, target: any, instruction: Immutable<IRefBindingInstruction>): void {
    const $from = instruction.from as any;
    addBindable(renderable, new Ref($from.$kind ? $from : this.parser.parse($from, BindingType.IsRef), target, this.context));
  }

  public [TargetedInstructionType.stylePropertyBinding](renderable: IRenderable, target: any, instruction: Immutable<IStylePropertyBindingInstruction>): void {
    const $from = instruction.from as any;
    addBindable(renderable, new Binding($from.$kind ? $from : this.parser.parse($from, BindingType.IsPropertyCommand | BindingMode.toView), (<any>target).style, instruction.to, BindingMode.toView, this.observerLocator, this.context));
  }

  public [TargetedInstructionType.setProperty](renderable: IRenderable, target: any, instruction: Immutable<ISetPropertyInstruction>): void {
    target[instruction.to] = instruction.value;
  }

  public [TargetedInstructionType.setAttribute](renderable: IRenderable, target: any, instruction: Immutable<ISetAttributeInstruction>): void {
    DOM.setAttribute(target, instruction.to, instruction.value);
  }

  public [TargetedInstructionType.hydrateElement](renderable: IRenderable, target: any, instruction: Immutable<IHydrateElementInstruction>): void {
    const context = this.context;
    const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
    const component = context.get<ICustomElement>(customElementKey(instruction.res));

    this.hydrateElementInstance(renderable, target, instruction, component);
    operation.dispose();
  }

  public [TargetedInstructionType.hydrateAttribute](renderable: IRenderable, target: any, instruction: Immutable<IHydrateAttributeInstruction>): void {
    const childInstructions = instruction.instructions;
    const context = this.context;

    const operation = context.beginComponentOperation(renderable, target, instruction);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    component.$hydrate(this.renderingEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this as any)[current.type](renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
  }

  public [TargetedInstructionType.hydrateTemplateController](renderable: IRenderable, target: any, instruction: Immutable<IHydrateTemplateController>, parts?: TemplatePartDefinitions): void {
    const childInstructions = instruction.instructions;
    const factory = this.renderingEngine.getViewFactory(instruction.def, this.context);
    const context = this.context;
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, DOM.convertToRenderLocation(target), false);

    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    component.$hydrate(this.renderingEngine);

    if (instruction.link) {
      (component as any).link(renderable.$attachableTail);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      (this as any)[current.type](renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
  }

  public [TargetedInstructionType.renderStrategy](renderable: IRenderable, target: any, instruction: Immutable<IRenderStrategyInstruction>): void {
    const strategyName = instruction.name;
    if (this[strategyName] === undefined) {
      const strategy = this.context.get<IRenderStrategy>(RenderStrategyResource.keyFrom(strategyName));
      if (strategy === null || strategy === undefined) {
        throw new Error(`Unknown renderStrategy "${strategyName}"`);
      }
      this[strategyName] = strategy.render.bind(strategy);
    }
    this[strategyName](renderable, target, instruction);
  }

  public [TargetedInstructionType.letElement](renderable: IRenderable, target: any, instruction: Immutable<ILetElementInstruction>): void {
    target.remove();
    const childInstructions = instruction.instructions;
    const toViewModel = instruction.toViewModel;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const childInstruction = childInstructions[i];
      const $from: any = childInstruction.from;
      addBindable(renderable, new LetBinding(
        $from.$kind ? $from : this.parser.parse($from, BindingType.IsPropertyCommand),
        childInstruction.to,
        this.observerLocator,
        this.context,
        toViewModel
      ));
    }
  }
}
