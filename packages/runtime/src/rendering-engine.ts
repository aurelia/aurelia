import {
  all,
  DI,
  IContainer,
  IDisposable,
  IIndexable,
  IResourceDescriptions,
  Key,
  Reporter,
  Writable,
  Metadata,
} from '@aurelia/kernel';
import {
  InstructionTypeName,
  ITargetedInstruction,
  PartialCustomElementDefinitionParts,
} from './definitions';
import {
  IDOM,
  INode,
  INodeSequenceFactory,
  NodeSequence,
} from './dom';
import { LifecycleFlags } from './flags';
import {
  IController,
  ILifecycle,
  IRenderContext,
  IViewFactory,
  IViewModel,
} from './lifecycle';
import {
  IAccessor,
  IPropertyObserver,
  ISubscribable,
  ISubscriber,
  ISubscriberCollection,
} from './observation';
import { subscriberCollection } from './observation/subscriber-collection';
import { RenderContext } from './render-context';
import {
  CustomElement,
  IElementProjector,
  PartialCustomElementDefinition,
  CustomElementDefinition,
  CustomElementType,
} from './resources/custom-element';
import { Controller } from './templating/controller';
import { ViewFactory } from './templating/view';

export interface ITemplateCompiler {
  readonly name: string;

  compile(
    dom: IDOM,
    definition: PartialCustomElementDefinition,
    resources: IResourceDescriptions,
    viewCompileFlags?: ViewCompileFlags,
  ): CustomElementDefinition;
}

export const ITemplateCompiler = DI.createInterface<ITemplateCompiler>('ITemplateCompiler').noDefault();

export enum ViewCompileFlags {
  none        = 0b0_001,
  surrogate   = 0b0_010,
  shadowDOM   = 0b0_100,
}

export interface ITemplateFactory<T extends INode = INode> {
  create(parentRenderContext: IRenderContext<T>, definition: CustomElementDefinition): ITemplate<T>;
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
  readonly definition: CustomElementDefinition;
  render(controller: IController<T>, host?: T, parts?: Record<string, PartialCustomElementDefinition>, flags?: LifecycleFlags): void;
  render(viewModel: IViewModel<T>, host?: T, parts?: Record<string, PartialCustomElementDefinition>, flags?: LifecycleFlags): void;
}

// This is the main implementation of ITemplate.
// It is used to create instances of IController based on a compiled CustomElementDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a CustomElementDefinition
// and create instances of it on demand.
export class CompiledTemplate<T extends INode = INode> implements ITemplate {
  public constructor(
    public readonly dom: IDOM<T>,
    public readonly definition: CustomElementDefinition,
    public readonly factory: INodeSequenceFactory<T>,
    public readonly renderContext: IRenderContext<T>,
  ) { }

  public render(
    viewModel: IViewModel<T>,
    host?: T,
    parts?: PartialCustomElementDefinitionParts,
    flags?: LifecycleFlags,
  ): void;
  public render(
    controller: IController<T>,
    host?: T,
    parts?: PartialCustomElementDefinitionParts,
    flags?: LifecycleFlags,
  ): void;
  public render(
    viewModelOrController: IViewModel<T> | IController<T>,
    host?: T,
    parts?: PartialCustomElementDefinitionParts,
    flags: LifecycleFlags = LifecycleFlags.none,
  ): void {
    const controller = viewModelOrController instanceof Controller
      ? viewModelOrController as IController<T>
      : (viewModelOrController as IViewModel<T>).$controller;
    if (controller == void 0) {
      throw new Error(`Controller is missing from the view model`); // TODO: create error code
    }
    const nodes = (controller as Writable<IController>).nodes = this.factory.createNodeSequence();
    (controller as Writable<IController>).context = this.renderContext;
    (controller as Writable<IController>).scopeParts = this.definition.scopeParts;
    (controller as Writable<IController>).isStrictBinding = this.definition.isStrictBinding;
    flags |= this.definition.strategy;
    this.renderContext.render(flags, controller, nodes.findTargets(), this.definition, host, parts);
  }
}

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
    templateDefinition: CustomElementDefinition,
    host?: INode,
    parts?: PartialCustomElementDefinitionParts
  ): void;
}

export const IRenderer = DI.createInterface<IRenderer>('IRenderer').noDefault();

export interface IRenderingEngine {
  getElementTemplate<T extends INode = INode>(
    dom: IDOM<T>,
    definition: CustomElementDefinition,
    parentContext?: IContainer | IRenderContext<T>,
    componentType?: CustomElementType,
  ): ITemplate<T>|undefined;

  getViewFactory<T extends INode = INode>(
    dom: IDOM<T>,
    source: PartialCustomElementDefinition,
    parentContext?: IContainer | IRenderContext<T>,
  ): IViewFactory<T>;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>('IRenderingEngine').withDefault(x => x.singleton(RenderingEngine));

/** @internal */
export class RenderingEngine implements IRenderingEngine {
  public constructor(
    @IContainer private readonly container: IContainer,
    @ITemplateFactory private readonly templateFactory: ITemplateFactory,
    @ILifecycle private readonly lifecycle: ILifecycle,
    @ITemplateCompiler private readonly compiler: ITemplateCompiler,
  ) { }

  public getElementTemplate<T extends INode = INode>(
    dom: IDOM<T>,
    definition: CustomElementDefinition,
    parentContext?: IContainer | IRenderContext<T>,
    componentType?: CustomElementType
  ): ITemplate<T> | undefined {
    if (definition == void 0) {
      return void 0;
    }
    if (parentContext == void 0) {
      parentContext = this.container as ExposedContext;
    }

    return this.templateFromSource(dom, definition, parentContext, componentType);
  }

  public getViewFactory<T extends INode = INode>(
    dom: IDOM<T>,
    partialDefinition: PartialCustomElementDefinition,
    parentContext?: IContainer | IRenderContext<T>
  ): IViewFactory<T> {
    if (partialDefinition == void 0) {
      throw new Error(`No definition provided`); // TODO: create error code
    }

    let definition: CustomElementDefinition;
    if (partialDefinition instanceof CustomElementDefinition) {
      definition = partialDefinition;
    } else if (Metadata.hasOwn(CustomElement.name, partialDefinition)) {
      definition = Metadata.getOwn(CustomElement.name, partialDefinition);
    } else {
      definition = CustomElementDefinition.create(partialDefinition);
      // Make sure the full definition can be retrieved both from the partialDefinition as well as its dynamically created class
      Metadata.define(CustomElement.name, definition, partialDefinition);
      Metadata.define(CustomElement.name, definition, definition.Type);
    }

    if (parentContext == void 0) {
      parentContext = this.container as ExposedContext;
    }
    const factorykey = CustomElement.keyFrom(`${parentContext.path}:factory`);

    let factory = Metadata.getOwn(factorykey, definition);
    if (factory === void 0) {
      const template = this.templateFromSource(dom, definition, parentContext, void 0);
      factory = new ViewFactory(definition.name, template, this.lifecycle);
      factory.setCacheSize(definition.cache, true);
      Metadata.define(factorykey, factory, definition);
    }

    return factory as IViewFactory<T>;
  }

  private templateFromSource<T extends INode = INode>(
    dom: IDOM,
    definition: CustomElementDefinition,
    parentContext: IContainer | IRenderContext,
    componentType?: CustomElementType
  ): ITemplate<T> {
    const templateKey = CustomElement.keyFrom(`${parentContext.path}:template`);

    let template = Metadata.getOwn(templateKey, definition);
    if (template === void 0) {
      template = this.templateFromSourceCore(dom, definition, parentContext, componentType);
      Metadata.define(templateKey, template, definition);
    }

    return template;
  }

  private templateFromSourceCore(
    dom: IDOM,
    definition: CustomElementDefinition,
    parentContext: IContainer | IRenderContext,
    componentType?: CustomElementType
  ): ITemplate {
    const renderContext = new RenderContext(dom, parentContext, definition.dependencies, componentType);

    if (definition.template != void 0 && definition.needsCompile) {
      const compiledDefinitionKey = CustomElement.keyFrom(`${parentContext.path}:compiled-definition`);

      let compiledDefinition = Metadata.getOwn(compiledDefinitionKey, definition) as CustomElementDefinition | undefined;
      if (compiledDefinition === void 0) {
        compiledDefinition = this.compiler.compile(
          dom,
          definition as PartialCustomElementDefinition,
          renderContext.createRuntimeCompilationResources(),
          ViewCompileFlags.surrogate,
        );
        Metadata.define(compiledDefinitionKey, compiledDefinition, definition);
      }

      return this.templateFactory.create(renderContext, compiledDefinition);
    }

    return this.templateFactory.create(renderContext, definition);
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

  public constructor(
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

/** @internal */
export type ExposedContext = IRenderContext & IDisposable & IContainer;
