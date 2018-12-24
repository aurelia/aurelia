import {
  all,
  Class,
  DI,
  IContainer,
  IDisposable,
  IIndexable,
  Immutable,
  ImmutableArray,
  inject,
  IRegistry,
  IResolver,
  IResourceDescriptions,
  PLATFORM,
  Registration,
  Reporter,
  RuntimeCompilationResources,
  Tracer,
  Writable
} from '@aurelia/kernel';
import { Binding } from './binding/binding';
import { BindingMode } from './binding/binding-mode';
import { Call } from './binding/call';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { LetBinding } from './binding/let-binding';
import { Ref } from './binding/ref';
import {
  BindableDefinitions,
  buildTemplateDefinition,
  customAttributeKey,
  customElementBehavior,
  customElementKey,
  ICallBindingInstruction,
  IElementHydrationOptions,
  IHydrateAttributeInstruction,
  IHydrateElementInstruction,
  IHydrateLetElementInstruction,
  IHydrateTemplateController,
  IInterpolationInstruction,
  IIteratorBindingInstruction,
  IPropertyBindingInstruction,
  IRefBindingInstruction,
  ISetPropertyInstruction,
  ITargetedInstruction,
  ITemplateDefinition,
  TargetedInstructionType,
  TemplateDefinition,
  TemplatePartDefinitions
} from './definitions';
import { IDOM, INodeSequenceFactory, NodeSequence } from './dom';
import { INode, IRenderLocation } from './dom.interfaces';
import {
  IAttach,
  IAttachables,
  IBindables,
  IBindScope,
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
  LifecycleFlags,
  MutationKind
} from './observation';
import { IObserverLocator } from './observation/observer-locator';
import { Observer } from './observation/property-observation';
import { subscriberCollection } from './observation/subscriber-collection';
import { ICustomAttribute, ICustomAttributeType } from './resources/custom-attribute';
import { ICustomElement, ICustomElementType } from './resources/custom-element';
import { ViewFactory } from './templating/view';

const slice = Array.prototype.slice;

export interface ITemplateCompiler {
  readonly name: string;
  compile(dom: IDOM, definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>().noDefault();

export enum ViewCompileFlags {
  none        = 0b0_001,
  surrogate   = 0b0_010,
  shadowDOM   = 0b0_100,
}

export interface ITemplateFactory {
  create(parentRenderContext: IRenderContext, definition: TemplateDefinition): ITemplate;
}

export const ITemplateFactory = DI.createInterface<ITemplateFactory>().noDefault();

// The basic template abstraction that allows consumers to create
// instances of an INodeSequence on-demand. Templates are contextual in that they are, in the very least,
// part of a particular application, with application-level resources, but they also may have their
// own scoped resources or be part of another view (via a template controller) which provides a
// context for the template.
export interface ITemplate {
  readonly renderContext: IRenderContext;
  readonly dom: IDOM;
  render(renderable: IRenderable, host?: INode, parts?: Immutable<Record<string, ITemplateDefinition>>): void;
}

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
export class CompiledTemplate implements ITemplate {
  public readonly factory: INodeSequenceFactory;
  public readonly renderContext: IRenderContext;
  public readonly dom: IDOM;

  private definition: TemplateDefinition;

  constructor(dom: IDOM, definition: TemplateDefinition, factory: INodeSequenceFactory, parentRenderContext: IRenderContext) {
    this.dom = dom;
    this.definition = definition;
    this.factory = factory;
    this.renderContext = createRenderContext(dom, parentRenderContext, definition.dependencies);
  }

  public render(renderable: IRenderable, host?: unknown, parts?: TemplatePartDefinitions): void {
    const nodes = (renderable as Writable<IRenderable>).$nodes = this.factory.createNodeSequence();
    (renderable as Writable<IRenderable>).$context = this.renderContext;
    this.renderContext.render(renderable, nodes.findTargets(), this.definition, host, parts);
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

export interface IRenderingEngine {
  getElementTemplate(dom: IDOM, definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
  getViewFactory(dom: IDOM, source: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;

  applyRuntimeBehavior(Type: ICustomAttributeType, instance: ICustomAttribute): void;
  applyRuntimeBehavior(Type: ICustomElementType, instance: ICustomElement): void;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>().withDefault(x => x.singleton(RenderingEngine));

@inject(IContainer, ITemplateFactory, ILifecycle, all(ITemplateCompiler))
/** @internal */
export class RenderingEngine implements IRenderingEngine {
  private behaviorLookup: Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior>;
  private compilers: Record<string, ITemplateCompiler>;
  private container: IContainer;
  private templateFactory: ITemplateFactory;
  private viewFactoryLookup: Map<Immutable<ITemplateDefinition>, IViewFactory>;
  private lifecycle: ILifecycle;
  private templateLookup: Map<TemplateDefinition, ITemplate>;

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

  public getElementTemplate(dom: IDOM, definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate {
    if (!definition) {
      return null;
    }

    let found = this.templateLookup.get(definition);

    if (!found) {
      found = this.templateFromSource(dom, definition);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.renderContext !== null && componentType) {
        componentType.register(found.renderContext as ExposedContext);
      }

      this.templateLookup.set(definition, found);
    }

    return found;
  }

  public getViewFactory(dom: IDOM, definition: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory {
    if (!definition) {
      return null;
    }

    let factory = this.viewFactoryLookup.get(definition);

    if (!factory) {
      const validSource = buildTemplateDefinition(null, definition);
      const template = this.templateFromSource(dom, validSource, parentContext);
      factory = new ViewFactory(validSource.name, template, this.lifecycle);
      factory.setCacheSize(validSource.cache, true);
      this.viewFactoryLookup.set(definition, factory);
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

  private templateFromSource(dom: IDOM, definition: TemplateDefinition, parentContext?: IRenderContext): ITemplate {
    parentContext = parentContext || this.container as ExposedContext;

    if (definition && definition.template) {
      if (definition.build.required) {
        const compilerName = definition.build.compiler || defaultCompilerName;
        const compiler = this.compilers[compilerName];

        if (!compiler) {
          throw Reporter.error(20, compilerName);
        }

        definition = compiler.compile(dom, definition as ITemplateDefinition, new RuntimeCompilationResources(parentContext as ExposedContext), ViewCompileFlags.surrogate);
      }

      return this.templateFactory.create(parentContext, definition);
    }

    return noViewTemplate;
  }
}

export function createRenderContext(dom: IDOM, parentRenderContext: IRenderContext, dependencies: ImmutableArray<IRegistry>): IRenderContext {
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

  context.render = function(this: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    renderer.render(dom, this, renderable, targets, templateDefinition, host, parts);
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

/** @internal */
@subscriberCollection(MutationKind.instance)
export class ChildrenObserver implements Partial<IChildrenObserver> {
  public hasChanges: boolean;

  private children: ICustomElement[];
  private customElement: ICustomElement & { $childrenChanged?(): void };
  private lifecycle: ILifecycle;
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
export type ExposedContext = IRenderContext & IDisposable & IContainer;

export interface IRenderer {
  instructionRenderers: Record<string, IInstructionRenderer>;
  render(dom: IDOM, context: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
}

export const IRenderer = DI.createInterface<IRenderer>().withDefault(x => x.singleton(Renderer));

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}

export interface IInstructionRenderer<TType extends string = string> extends Partial<IInstructionTypeClassifier<TType>> {
  render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: unknown, instruction: ITargetedInstruction, ...rest: unknown[]): void;
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

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, definition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    if (Tracer.enabled) { Tracer.enter('Renderer.render', slice.call(arguments)); }
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
        instructionRenderers[current.type].render(dom, context, renderable, target, current, parts);
      }
    }

    if (host) {
      const surrogateInstructions = definition.surrogates;

      for (let i = 0, ii = surrogateInstructions.length; i < ii; ++i) {
        const current = surrogateInstructions[i];
        instructionRenderers[current.type].render(dom, context, renderable, host, current, parts);
      }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export function ensureExpression<TFrom>(parser: IExpressionParser, srcOrExpr: TFrom, bindingType: BindingType): Exclude<TFrom, string> {
  if (typeof srcOrExpr === 'string') {
    return parser.parse(srcOrExpr, bindingType) as unknown as Exclude<TFrom, string>;
  }
  return srcOrExpr as Exclude<TFrom, string>;
}

export function addBindable(renderable: IBindables, bindable: IBindScope): void {
  if (Tracer.enabled) { Tracer.enter('addBindable', slice.call(arguments)); }
  bindable.$prevBind = renderable.$bindableTail;
  bindable.$nextBind = null;
  if (renderable.$bindableTail === null) {
    renderable.$bindableHead = bindable;
  } else {
    renderable.$bindableTail.$nextBind = bindable;
  }
  renderable.$bindableTail = bindable;
  if (Tracer.enabled) { Tracer.leave(); }
}

export function addAttachable(renderable: IAttachables, attachable: IAttach): void {
  if (Tracer.enabled) { Tracer.enter('addAttachable', slice.call(arguments)); }
  attachable.$prevAttach = renderable.$attachableTail;
  attachable.$nextAttach = null;
  if (renderable.$attachableTail === null) {
    renderable.$attachableHead = attachable;
  } else {
    renderable.$attachableTail.$nextAttach = attachable;
  }
  renderable.$attachableTail = attachable;
  if (Tracer.enabled) { Tracer.leave(); }
}

@instructionRenderer(TargetedInstructionType.setProperty)
/** @internal */
export class SetPropertyRenderer implements IInstructionRenderer {
  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: IIndexable, instruction: ISetPropertyInstruction): void {
    if (Tracer.enabled) { Tracer.enter('SetPropertyRenderer.render', slice.call(arguments)); }
    target[instruction.to] = instruction.value;
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateElement)
/** @internal */
export class CustomElementRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: IRenderLocation, instruction: IHydrateElementInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CustomElementRenderer.render', slice.call(arguments)); }
    const operation = context.beginComponentOperation(renderable, target, instruction, null, null, target, true);
    const component = context.get<ICustomElement>(customElementKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(dom, this.renderingEngine, target, instruction as IElementHydrationOptions);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(dom, context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateAttribute)
/** @internal */
export class CustomAttributeRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: unknown, instruction: IHydrateAttributeInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CustomAttributeRenderer.render', slice.call(arguments)); }
    const operation = context.beginComponentOperation(renderable, target, instruction);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine);

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(dom, context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IRenderingEngine)
@instructionRenderer(TargetedInstructionType.hydrateTemplateController)
/** @internal */
export class TemplateControllerRenderer implements IInstructionRenderer {
  private renderingEngine: IRenderingEngine;

  constructor(renderingEngine: IRenderingEngine) {
    this.renderingEngine = renderingEngine;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: unknown, instruction: IHydrateTemplateController, parts?: TemplatePartDefinitions): void {
    if (Tracer.enabled) { Tracer.enter('TemplateControllerRenderer.render', slice.call(arguments)); }
    const factory = this.renderingEngine.getViewFactory(dom, instruction.def, context);
    const operation = context.beginComponentOperation(renderable, target, instruction, factory, parts, dom.convertToRenderLocation(target), false);
    const component = context.get<ICustomAttribute>(customAttributeKey(instruction.res));
    const instructionRenderers = context.get(IRenderer).instructionRenderers;
    const childInstructions = instruction.instructions;

    component.$hydrate(this.renderingEngine);

    if (instruction.link) {
      (component as ICustomAttribute & { link(attachableTail: IAttach): void}).link(renderable.$attachableTail);
    }

    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const current = childInstructions[i];
      instructionRenderers[current.type].render(dom, context, renderable, component, current);
    }

    addBindable(renderable, component);
    addAttachable(renderable, component);

    operation.dispose();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.hydrateLetElement)
/** @internal */
export class LetElementRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: unknown, instruction: IHydrateLetElementInstruction): void {
    if (Tracer.enabled) { Tracer.enter('LetElementRenderer.render', slice.call(arguments)); }
    dom.remove(target);
    const childInstructions = instruction.instructions;
    const toViewModel = instruction.toViewModel;
    for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
      const childInstruction = childInstructions[i];
      const expr = ensureExpression(this.parser, childInstruction.from, BindingType.IsPropertyCommand);
      const bindable = new LetBinding(expr, childInstruction.to, this.observerLocator, context, toViewModel);
      addBindable(renderable, bindable);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.callBinding)
/** @internal */
export class CallBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: ICallBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('CallBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.CallCommand);
    const bindable = new Call(expr, target, instruction.to, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser)
@instructionRenderer(TargetedInstructionType.refBinding)
/** @internal */
export class RefBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;

  constructor(parser: IExpressionParser) {
    this.parser = parser;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IRefBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('RefBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsRef);
    const bindable = new Ref(expr, target, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.interpolation)
/** @internal */
export class InterpolationBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IInterpolationInstruction): void {
    if (Tracer.enabled) { Tracer.enter('InterpolationBindingRenderer.render', slice.call(arguments)); }
    let bindable: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      bindable = new MultiInterpolationBinding(this.observerLocator, expr, target, instruction.to, BindingMode.toView, context);
    } else {
      bindable = new InterpolationBinding(expr.firstExpression, expr, target, instruction.to, BindingMode.toView, this.observerLocator, context, true);
    }
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.propertyBinding)
/** @internal */
export class PropertyBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IPropertyBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('PropertyBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | instruction.mode);
    const bindable = new Binding(expr, target, instruction.to, instruction.mode, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.iteratorBinding)
/** @internal */
export class IteratorBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(dom: IDOM, context: IRenderContext, renderable: IRenderable, target: INode, instruction: IIteratorBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('IteratorBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.ForCommand);
    const bindable = new Binding(expr, target, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export const BasicRenderer = {
  register(container: IContainer): void {
    container.register(
      SetPropertyRenderer as unknown as IRegistry,
      CustomElementRenderer as unknown as IRegistry,
      CustomAttributeRenderer as unknown as IRegistry,
      TemplateControllerRenderer as unknown as IRegistry,
      LetElementRenderer as unknown as IRegistry,
      CallBindingRenderer as unknown as IRegistry,
      RefBindingRenderer as unknown as IRegistry,
      InterpolationBindingRenderer as unknown as IRegistry,
      PropertyBindingRenderer as unknown as IRegistry,
      IteratorBindingRenderer as unknown as IRegistry
    );
  }
};
