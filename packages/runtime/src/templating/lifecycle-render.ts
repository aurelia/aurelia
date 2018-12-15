import { all, Class, DI, IContainer, IDisposable, IIndexable, Immutable, ImmutableArray, inject, IRegistry, IResolver, PLATFORM, Registration, Reporter, Writable } from '../../kernel';
import { Scope } from '../binding/binding-context';
import { Observer } from '../binding/property-observation';
import { subscriberCollection } from '../binding/subscriber-collection';
import { BindableDefinitions, buildTemplateDefinition, customElementBehavior, IHydrateElementInstruction, ITargetedInstruction, ITemplateDefinition, TemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { DOM, INode, INodeSequence, INodeSequenceFactory, IRenderLocation, NodeSequence, NodeSequenceFactory } from '../dom';
import { Hooks, ILifecycle, IRenderable, IRenderContext, IViewFactory, State } from '../lifecycle';
import { IAccessor, IPropertySubscriber, ISubscribable, ISubscriberCollection, LifecycleFlags, MutationKind } from '../observation';
import { IResourceDescriptions, RuntimeCompilationResources } from '../resource';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { ViewFactory } from './view';
import { IFabricNode, IFabricRenderLocation, IFabricNodeSequence, IThreeJsNodeSequenceFactory, ThreeJsNodeSequenceFactory, FabricNodeSequence } from '../three-dom';
import { I3VNode } from 'runtime/three-vnode';


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

export type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;

export interface ICustomElementHost extends IFabricRenderLocation {
  $customElement?: ICustomElement;
}

export type ElementDefinition = Immutable<Required<ITemplateDefinition>> | null;

export interface IElementProjector {
  readonly host: ICustomElementHost;
  readonly children: ArrayLike<ICustomElementHost>;

  provideEncapsulationSource(parentEncapsulationSource: ICustomElementHost): ICustomElementHost;
  project(nodes: IFabricNodeSequence): void;
  take(nodes: IFabricNodeSequence): void;

  subscribeToChildrenChange(callback: () => void): void;
}

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
  render?(host: Node | I3VNode, parts: Immutable<Pick<IHydrateElementInstruction, 'parts'>>): IElementTemplateProvider | void;
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
export function $hydrateElement(this: Writable<ICustomElement>, renderingEngine: IRenderingEngine, host: Node | I3VNode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  this.$scope = Scope.create(this, null);
  this.$host = host as ICustomElementHost;
  this.$projector = determineProjector(this, host, description);

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
  host: Node | I3VNode,
  definition: TemplateDefinition
): IElementProjector {
  // if (definition.shadowOptions || definition.hasSlots) {
  //   if (definition.containerless) {
  //     throw Reporter.error(21);
  //   }

  //   return new ShadowDOMProjector($customElement, host, definition);
  // }

  // if (definition.containerless) {
  //   return new ContainerlessProjector($customElement, host);
  // }

  return new HostProjector($customElement, host as ICustomElementHost);
}

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
  getViewFactory(source: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;

  applyRuntimeBehavior(Type: ICustomAttributeType, instance: ICustomAttribute): void;
  applyRuntimeBehavior(Type: ICustomElementType, instance: ICustomElement): void;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>()
  .withDefault(x => x.singleton(RenderingEngine));

const defaultCompilerName = 'default';

@inject(IContainer, ILifecycle, all(ITemplateCompiler))
/*@internal*/
export class RenderingEngine implements IRenderingEngine {
  private templateLookup: Map<TemplateDefinition, ITemplate> = new Map();
  private factoryLookup: Map<Immutable<ITemplateDefinition>, IViewFactory> = new Map();
  private behaviorLookup: Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior> = new Map();
  private compilers: Record<string, ITemplateCompiler>;

  constructor(private container: IContainer, private lifecycle: ILifecycle, templateCompilers: ITemplateCompiler[]) {
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
      const validSource = buildTemplateDefinition(null, definition);
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

/*@internal*/
export class HostProjector implements IElementProjector {
  private readonly isAppHost: boolean;
  constructor($customElement: ICustomElement, public host: ICustomElementHost) {
    host.$customElement = $customElement;
    this.isAppHost = host.hasOwnProperty('$au');
  }

  get children(): ArrayLike<I3VNode & ICustomElementHost> {
    return PLATFORM.emptyArray;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: I3VNode): ICustomElementHost {
    return (parentEncapsulationSource as ICustomElementHost) || this.host;
  }

  public project(nodes: IFabricNodeSequence): void {
    nodes.appendTo(this.host);
    if (!this.isAppHost) {
      this.project = PLATFORM.noop;
    }
  }

  public take(nodes: IFabricNodeSequence): void {
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
        return this['$observers'].$children.getValue();
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
    get: function(): unknown { return this['$observers'][name].getValue(); },
    set: function(value: unknown): void { this['$observers'][name].setValue(value, LifecycleFlags.updateTargetInstance); }
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
      this.customElement.$projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
      // this.children = findElements(this.customElement.$projector.children);
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
    // this.children = findElements(this.customElement.$projector.children);

    // if ('$childrenChanged' in this.customElement) {
    //   this.customElement.$childrenChanged();
    // }

    // this.lifecycle.enqueueFlush(this);
    // this.hasChanges = true;
  }
}

/*@internal*/
export function findElements(nodes: ArrayLike<INode>): ICustomElement[] {
  const components: ICustomElement[] = [];

  // for (let i = 0, ii = nodes.length; i < ii; ++i) {
  //   const current = nodes[i];
  //   const component = customElementBehavior(current);

  //   if (component !== null) {
  //     components.push(component);
  //   }
  // }

  return components;
}

// The basic template abstraction that allows consumers to create
// instances of an INodeSequence on-demand. Templates are contextual in that they are, in the very least,
// part of a particular application, with application-level resources, but they also may have their
// own scoped resources or be part of another view (via a template controller) which provides a
// context for the template.
export interface ITemplate {
  readonly renderContext: IRenderContext;
  render(renderable: IRenderable, host?: Node | I3VNode, parts?: TemplatePartDefinitions): void;
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/*@internal*/
export class CompiledTemplate implements ITemplate {
  public readonly factory: IThreeJsNodeSequenceFactory;
  public readonly renderContext: IRenderContext;

  constructor(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, private templateDefinition: TemplateDefinition) {
    this.factory = ThreeJsNodeSequenceFactory.createFor(templateDefinition.template);
    this.renderContext = createRenderContext(renderingEngine, parentRenderContext, templateDefinition.dependencies);
  }

  public render(renderable: IRenderable, host?: I3VNode, parts?: TemplatePartDefinitions): void {
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
    (<Writable<IRenderable>>renderable).$nodes = FabricNodeSequence.empty;
    (<Writable<IRenderable>>renderable).$context = null;
  }
};

/*@internal*/
export type ExposedContext = IRenderContext & IDisposable & IContainer;

export function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<IRegistry>): IRenderContext {
  const context = <ExposedContext>parentRenderContext.createChild();
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider(renderingEngine);
  const renderLocationProvider = new InstanceProvider<IFabricRenderLocation>();
  const renderer = context.get(IRenderer);

  DOM.registerElementResolver(context, elementProvider);

  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IRenderable, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IFabricRenderLocation, renderLocationProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  context.render = function(this: IRenderContext, renderable: IRenderable, targets: ArrayLike<I3VNode>, templateDefinition: TemplateDefinition, host?: I3VNode, parts?: TemplatePartDefinitions): void {
    renderer.render(this, renderable, targets, templateDefinition, host, parts);
  };

  context.beginComponentOperation = function(renderable: IRenderable, target: I3VNode, instruction: ITargetedInstruction, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IFabricRenderLocation): IDisposable {
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

export interface IRenderer {
  instructionRenderers: Record<string, IInstructionRenderer>;
  render(context: IRenderContext, renderable: IRenderable, targets: ArrayLike<I3VNode>, templateDefinition: TemplateDefinition, host?: I3VNode, parts?: TemplatePartDefinitions): void;
}

export const IRenderer = DI.createInterface<IRenderer>().withDefault(x => x.singleton(Renderer));

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}

export interface IInstructionRenderer<TType extends string = string> extends Partial<IInstructionTypeClassifier<TType>> {
  render(context: IRenderContext, renderable: IRenderable, target: unknown, instruction: ITargetedInstruction, ...rest: unknown[]): void;
}

export const IInstructionRenderer = DI.createInterface<IInstructionRenderer>().noDefault();

type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
type DecoratedInstructionRenderer<TType extends string, TProto, TClass> =  Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;

type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;

export function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType> {
  return function decorator<TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>): DecoratedInstructionRenderer<TType, TProto, TClass> {
    // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
    const decoratedTarget = function(...args: unknown[]): TProto {
      const instance = new target(...args);
      instance.instructionType = instructionType;
      return instance;
    } as unknown as DecoratedInstructionRenderer<TType, TProto, TClass>;
    // make sure we register the decorated constructor with DI
    decoratedTarget.register = function register(container: IContainer): IResolver {
      return Registration.singleton(IInstructionRenderer, decoratedTarget).register(container, IInstructionRenderer);
    };
    // copy over any static properties such as inject (set by preceding decorators)
    // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
    // the length (number of ctor arguments) is copied for the same reason
    const ownProperties = Object.getOwnPropertyDescriptors(target);
    Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
      Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
    });
    return decoratedTarget;
  };
}

/* @internal */
@inject(all(IInstructionRenderer))
export class Renderer implements IRenderer {
  public instructionRenderers: Record<string, IInstructionRenderer>;

  constructor(instructionRenderers: IInstructionRenderer[]) {
    const record = this.instructionRenderers = {};
    instructionRenderers.forEach(item => {
      record[item.instructionType] = item;
    });
  }

  public render(context: IRenderContext, renderable: IRenderable, targets: ArrayLike<I3VNode>, definition: TemplateDefinition, host?: I3VNode, parts?: TemplatePartDefinitions): void {
    const targetInstructions = definition.instructions;
    const instructionRenderers = this.instructionRenderers;

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
        instructionRenderers[current.type].render(context, renderable, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        instructionRenderers[current.type].render(context, renderable, host, current, parts);
      }
    }
  }
}
