import {
  all,
  DI,
  IContainer,
  IDisposable,
  IIndexable,
  InstanceProvider,
  IResolver,
  IResourceDescriptions,
  Key,
  Reporter,
  RuntimeCompilationResources,
  Writable,
} from '@aurelia/kernel';

import {
  buildTemplateDefinition,
  IHydrateElementInstruction,
  InstructionTypeName,
  ITargetedInstruction,
  ITemplateDefinition,
  TargetedInstructionType,
  TemplateDefinition,
  TemplatePartDefinitions,
} from './definitions';
import {
  IDOM,
  INode,
  INodeSequenceFactory,
  IRenderLocation,
  NodeSequence,
} from './dom';
import { LifecycleFlags } from './flags';
import {
  IController,
  ILifecycle,
  IRenderContext,
  IViewFactory,
  IViewModel,
  Priority,
  ViewModelKind,
} from './lifecycle';
import {
  IAccessor,
  IPropertyObserver,
  ISubscribable,
  ISubscriber,
  ISubscriberCollection,
} from './observation';
import { subscriberCollection } from './observation/subscriber-collection';
import {
  CustomElement,
  ICustomElementInstanceData,
  ICustomElementType,
  IElementProjector
} from './resources/custom-element';
import { Controller } from './templating/controller';
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
  readonly definition: TemplateDefinition;
  render(controller: IController<T>, host?: T, parts?: Record<string, ITemplateDefinition>, flags?: LifecycleFlags): void;
  render(viewModel: IViewModel<T>, host?: T, parts?: Record<string, ITemplateDefinition>, flags?: LifecycleFlags): void;
}

// This is the main implementation of ITemplate.
// It is used to create instances of IController based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
export class CompiledTemplate<T extends INode = INode> implements ITemplate {
  public readonly factory: INodeSequenceFactory<T>;
  public readonly renderContext: IRenderContext<T>;
  public readonly dom: IDOM<T>;

  public readonly definition: TemplateDefinition;

  constructor(dom: IDOM<T>, definition: TemplateDefinition, factory: INodeSequenceFactory<T>, renderContext: IRenderContext<T>) {
    this.dom = dom;
    this.definition = definition;
    this.factory = factory;
    this.renderContext = renderContext;
  }

  public render(viewModel: IViewModel<T>, host?: T, parts?: TemplatePartDefinitions, flags?: LifecycleFlags): void;
  public render(controller: IController<T>, host?: T, parts?: TemplatePartDefinitions, flags?: LifecycleFlags): void;
  public render(viewModelOrController: IViewModel<T> | IController<T>, host?: T, parts?: TemplatePartDefinitions, flags: LifecycleFlags = LifecycleFlags.none): void {
    const controller = viewModelOrController instanceof Controller
      ? viewModelOrController as IController<T>
      : (viewModelOrController as IViewModel<T>).$controller;
    if (controller == void 0) {
      throw new Error(`Controller is missing from the view model`); // TODO: create error code
    }
    const nodes = (controller as Writable<IController>).nodes = this.factory.createNodeSequence();
    (controller as Writable<IController>).context = this.renderContext;
    (controller as Writable<IController>).scopeParts = this.definition.scopeParts;
    flags |= this.definition.strategy;
    this.renderContext.render(flags, controller, nodes.findTargets(), this.definition, host, parts);
  }
}

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/** @internal */
export const noViewTemplate: ITemplate = {
  renderContext: (void 0)!,
  dom: (void 0)!,
  definition: (void 0)!,
  render(viewModelOrController: IViewModel | IController): void {
    const controller = viewModelOrController instanceof Controller ? viewModelOrController : (viewModelOrController as IViewModel).$controller;
    (controller as Writable<IController>).nodes = NodeSequence.empty;
    (controller as Writable<IController>).context = void 0;
  }
};

const defaultCompilerName = 'default';

export interface IInstructionTypeClassifier<TType extends string = string> {
  instructionType: TType;
}

export interface IInstructionRenderer<
  TType extends InstructionTypeName = InstructionTypeName
> extends Partial<IInstructionTypeClassifier<TType>> {
  render(
    flags: LifecycleFlags,
    dom: IDOM,
    context: IRenderContext,
    renderable: IController,
    target: unknown,
    instruction: ITargetedInstruction,
    ...rest: unknown[]
  ): void;
}

export const IInstructionRenderer = DI.createInterface<IInstructionRenderer>('IInstructionRenderer').noDefault();

export interface IRenderer {
  instructionRenderers: Record<string, IInstructionRenderer['render']>;
  render(
    flags: LifecycleFlags,
    dom: IDOM,
    context: IRenderContext,
    renderable: IController,
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
    parentContext?: IContainer | IRenderContext<T>,
    componentType?: ICustomElementType,
  ): ITemplate<T>;

  getViewFactory<T extends INode = INode>(
    dom: IDOM<T>,
    source: ITemplateDefinition,
    parentContext?: IContainer | IRenderContext<T>,
  ): IViewFactory<T>;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));

/** @internal */
export class RenderingEngine implements IRenderingEngine {
  public static readonly inject: readonly Key[] = [IContainer, ITemplateFactory, ILifecycle, all(ITemplateCompiler)];

  private readonly compilers: Record<string, ITemplateCompiler>;
  private readonly container: IContainer;
  private readonly templateFactory: ITemplateFactory;
  private readonly viewFactoryLookup: Map<ITemplateDefinition, IViewFactory>;
  private readonly lifecycle: ILifecycle;
  private readonly templateLookup: Map<TemplateDefinition, ITemplate>;

  constructor(container: IContainer, templateFactory: ITemplateFactory, lifecycle: ILifecycle, templateCompilers: ITemplateCompiler[]) {
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

  // @ts-ignore
  public getElementTemplate<T extends INode = INode>(
    dom: IDOM<T>,
    definition: TemplateDefinition,
    parentContext?: IContainer | IRenderContext<T>,
    componentType?: ICustomElementType
  ): ITemplate<T> | undefined {
    if (definition == void 0) {
      return void 0;
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
    definition: ITemplateDefinition,
    parentContext?: IContainer | IRenderContext<T>
  ): IViewFactory<T> {
    if (definition == void 0) {
      throw new Error(`No definition provided`); // TODO: create error code
    }

    let factory = this.viewFactoryLookup.get(definition);

    if (!factory) {
      const validSource = buildTemplateDefinition(null, definition);
      const template = this.templateFromSource(dom, validSource, parentContext, void 0);
      factory = new ViewFactory(validSource.name, template, this.lifecycle);
      factory.setCacheSize(validSource.cache, true);
      this.viewFactoryLookup.set(definition, factory);
    }

    return factory as IViewFactory<T>;
  }

  private templateFromSource(
    dom: IDOM,
    definition: TemplateDefinition,
    parentContext?: IContainer | IRenderContext,
    componentType?: ICustomElementType
  ): ITemplate {
    if (parentContext == void 0) {
      parentContext = this.container as ExposedContext;
    }

    if (definition.template != void 0) {
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

class CustomElementInstanceData implements ICustomElementInstanceData {
  /**
   * Lazily set via component
   */
  public controller!: IController;
  constructor(
    public readonly parentController: IController,
    public readonly instruction: IHydrateElementInstruction
  ) {}
}

export function createRenderContext(
  dom: IDOM,
  parent: IRenderContext | IContainer,
  dependencies: Key[],
  componentType?: ICustomElementType
): IRenderContext {
  const context = parent.createChild() as ExposedContext;
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider();
  const renderLocationProvider = new InstanceProvider<IRenderLocation>();
  const renderer = context.get(IRenderer);

  let elementInstructionProvider: InstanceProvider<ICustomElementInstanceData>;

  dom.registerElementResolver(context, elementProvider);

  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IController, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IRenderLocation, renderLocationProvider);

  if (dependencies != void 0) {
    context.register(...dependencies);
  }

  //If the element has a view, support Recursive Components by adding self to own view template container.
  if (componentType) {
    componentType.register(context);
  }

  context.render = function(
    this: IRenderContext,
    flags: LifecycleFlags,
    renderable: IController,
    targets: ArrayLike<INode>,
    templateDefinition: TemplateDefinition,
    host?: INode,
    parts?: TemplatePartDefinitions,
  ): void {
    renderer.render(flags, dom, this, renderable, targets, templateDefinition, host, parts);
  };

  // @ts-ignore
  context.beginComponentOperation = function(
    renderable: IController,
    target: INode,
    instruction: ITargetedInstruction,
    factory: IViewFactory | null,
    parts?: TemplatePartDefinitions,
    location?: IRenderLocation,
  ): IDisposable {
    if (instruction.type === TargetedInstructionType.hydrateElement) {
      elementInstructionProvider = new InstanceProvider();
      context.registerResolver(ICustomElementInstanceData, elementInstructionProvider);

      elementInstructionProvider.prepare(new CustomElementInstanceData(
        renderable,
        instruction as IHydrateElementInstruction
      ));
    }
    renderableProvider.prepare(renderable);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);

    if (factory != null) {
      factoryProvider.prepare(factory, parts!);
    }

    if (location != null) {
      renderLocationProvider.prepare(location);
    }

    return context;
  };

  context.dispose = function (): void {
    if (elementInstructionProvider !== void 0) {
      elementInstructionProvider.dispose();
    }
    factoryProvider.dispose();
    renderableProvider.dispose();
    instructionProvider.dispose();
    elementProvider.dispose();
    renderLocationProvider.dispose();
  };

  return context;
}

/** @internal */
export class ViewFactoryProvider implements IResolver {
  private factory!: IViewFactory | null;

  public prepare(factory: IViewFactory, parts: TemplatePartDefinitions): void {
    this.factory = factory;
    factory.addParts(parts);
  }

  public resolve(handler: IContainer, requestor: ExposedContext): IViewFactory {
    const factory = this.factory;
    if (factory == null) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
      throw Reporter.error(51); // TODO: organize error codes
    }
    const found = factory.parts[factory.name];
    if (found) {
      const renderingEngine = handler.get(IRenderingEngine);
      const dom = handler.get(IDOM);
      return renderingEngine.getViewFactory(dom, found, requestor);
    }

    return factory;
  }

  public dispose(): void {
    this.factory = null;
  }
}

export interface ChildrenObserver extends
  IAccessor,
  ISubscribable,
  ISubscriberCollection,
  IPropertyObserver<IIndexable, string>{ }

/** @internal */
@subscriberCollection()
export class ChildrenObserver {
  public readonly propertyKey: string;
  public readonly obj: IIndexable;
  public observing: boolean;

  private readonly controller: IController;
  private readonly filter: typeof defaultChildFilter;
  private readonly map: typeof defaultChildMap;
  private readonly query: typeof defaultChildQuery;
  private readonly options?: MutationObserverInit;
  private readonly callback: () => void;
  private children: any[];

  constructor(
    controller: IController,
    viewModel: any,
    flags: LifecycleFlags,
    propertyName: string,
    cbName: string,
    query = defaultChildQuery,
    filter = defaultChildFilter,
    map = defaultChildMap,
    options?: MutationObserverInit
    ) {
    this.propertyKey = propertyName;
    this.obj = viewModel;
    this.callback = viewModel[cbName] as typeof ChildrenObserver.prototype.callback;
    this.query = query;
    this.filter = filter;
    this.map = map;
    this.options = options;
    this.children = (void 0)!;
    this.controller = controller;
    this.observing = false;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.createGetterSetter();
  }

  public getValue(): any[] {
    this.tryStartObserving();
    return this.children;
  }

  public setValue(newValue: unknown): void { /* do nothing */ }

  public subscribe(subscriber: ISubscriber): void {
    this.tryStartObserving();
    this.addSubscriber(subscriber);
  }

  private tryStartObserving() {
    if (!this.observing) {
      this.observing = true;
      const projector = this.controller.projector!;
      this.children = filterChildren(projector, this.query, this.filter, this.map);
      projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); }, this.options);
    }
  }

  private onChildrenChanged(): void {
    this.children = filterChildren(this.controller.projector!, this.query, this.filter, this.map);

    if (this.callback !== void 0) {
      this.callback.call(this.obj);
    }

    this.callSubscribers(this.children, undefined, this.persistentFlags | LifecycleFlags.updateTargetInstance);
  }

  private createGetterSetter(): void {
    if (
      !Reflect.defineProperty(
        this.obj,
        this.propertyKey,
        {
          enumerable: true,
          configurable: true,
          get: () => this.getValue(),
          set: () => { },
        }
      )
    ) {
      Reporter.write(1, this.propertyKey, this.obj);
    }
  }
}

/** @internal */
export function filterChildren(
  projector: IElementProjector,
  query: typeof defaultChildQuery,
  filter: typeof defaultChildFilter,
  map: typeof defaultChildMap
): any[] {
  const nodes = query(projector);
  const children = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const node = nodes[i];
    const controller = CustomElement.behaviorFor(node);
    const viewModel = controller ? controller.viewModel : null;

    if (filter(node, controller, viewModel)) {
      children.push(map(node, controller, viewModel));
    }
  }

  return children;
}

function defaultChildQuery(projector: IElementProjector): ArrayLike<INode> {
  return projector.children;
}

function defaultChildFilter(node: INode, controller?: IController, viewModel?: any): boolean {
  return !!viewModel;
}

function defaultChildMap(node: INode, controller?: IController, viewModel?: any): any {
  return viewModel;
}

/** @internal */
export type ExposedContext = IRenderContext & IDisposable & IContainer;
