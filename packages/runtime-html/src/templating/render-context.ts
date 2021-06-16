import { InstanceProvider } from '@aurelia/kernel';
import { FragmentNodeSequence, INode, INodeSequence, IRenderLocation } from '../dom.js';
import { IRenderer, ITemplateCompiler, IInstruction, ICompliationInstruction } from '../renderer.js';
import { CustomElementDefinition } from '../resources/custom-element.js';
import { IViewFactory, ViewFactory } from './view.js';
import { IAuSlotsInfo, IProjections } from '../resources/custom-elements/au-slot.js';
import { IPlatform } from '../platform.js';
import { IController } from './controller.js';

import type {
  Constructable,
  IContainer,
  IDisposable,
  IFactory,
  IResolver,
  IResourceKind,
  Key,
  Resolved,
  ResourceDefinition,
  ResourceType,
  Transformer,
} from '@aurelia/kernel';
import type { LifecycleFlags } from '@aurelia/runtime';
import type { ICustomAttributeViewModel, ICustomElementViewModel, IHydratableController } from './controller.js';
import type { Instruction, InstructionTypeName } from '../renderer.js';
import type { PartialCustomElementDefinition } from '../resources/custom-element.js';

const definitionContainerLookup = new WeakMap<CustomElementDefinition, WeakMap<IContainer, RenderContext>>();
const definitionContainerProjectionsLookup = new WeakMap<CustomElementDefinition, WeakMap<IContainer, WeakMap<Record<string, CustomElementDefinition>, RenderContext>>>();

const fragmentCache = new WeakMap<CustomElementDefinition, Node | null>();

export function isRenderContext(value: unknown): value is IRenderContext {
  return value instanceof RenderContext;
}

/**
 * A render context that wraps an `IContainer` and must be compiled before it can be used for composing.
 */
export interface IRenderContext extends IContainer {
  readonly platform: IPlatform;

  /**
   * The `CustomElementDefinition` that this `IRenderContext` was created with.
   *
   * If a `PartialCustomElementDefinition` was used to create this context, then this property will be the return value of `CustomElementDefinition.getOrCreate`.
   */
  readonly definition: CustomElementDefinition;

  /**
   * The `IContainer` (which may be, but is not guaranteed to be, an `IRenderContext`) that this `IRenderContext` was created with.
   */
  readonly parentContainer: IContainer;

  /**
   * Prepare this factory for creating child controllers. Only applicable for custom elements.
   *
   * @param instance - The component instance to make available to child components if this context's definition has `injectable` set to `true`.
   */
  beginChildComponentOperation(instance: ICustomElementViewModel): IRenderContext;

  /**
   * Compiles the backing `CustomElementDefinition` (if needed) and returns the compiled `IRenderContext` that exposes the compiled `CustomElementDefinition` as well as composing operations.
   *
   * This operation is idempotent.
   *
   * @returns The compiled `IRenderContext`.
   */
  compile(compilationInstruction: ICompliationInstruction | null): ICompiledRenderContext;

  /**
   * Creates an (or returns the cached) `IViewFactory` that can be used to create synthetic view controllers.
   *
   * @returns Either a new `IViewFactory` (if this is the first call), or a cached one.
   */
  getViewFactory(name?: string): IViewFactory;
}

/**
 * A compiled `IRenderContext` that can create instances of `INodeSequence` (based on the template of the compiled definition)
 * and begin a component operation to create new component instances.
 */
export interface ICompiledRenderContext extends IRenderContext {
  /**
   * The compiled `CustomElementDefinition`.
   *
   * If the passed-in `PartialCustomElementDefinition` had a non-null `template` and `needsCompile` set to `true`, this will be a new definition created by the `ITemplateCompiler`.
   */
  readonly compiledDefinition: CustomElementDefinition;

  /**
   * Returns a new `INodeSequence` based on the document fragment from the compiled `CustomElementDefinition`.
   *
   * A new instance will be created from a clone of the fragment on each call.
   *
   * @returns An new instance of `INodeSequence` if there is a template, otherwise a shared empty instance.
   */
  createNodes(): INodeSequence;

  /**
   * Prepare this context context for creating a new component instance.
   *
   * All parameters are optional injectable dependencies, that is: only those that are actually needed by the to-be-created component, need to be provided in order for that component to work.
   *
   * To avoid possible memory leaks, don't forget to call `dispose()` on the returned `IComponentFactory` after creating a component.
   *
   * @param parentController - The `IController` of the immediate parent of the to-be-created component. Not used by any built-in components.
   * @param host - The DOM node that declared the component, or the node that the component will be mounted to (in case of containerless). Used by some built-in custom attributes.
   * @param instruction - The hydrate instruction that resulted in the creation of this context context. Only used by `au-compose`.
   * @param viewFactory - The `IViewFactory` that was created from the template that the template controller was placed on. Only applicable for template controllers. Used by all built-in template controllers.
   * @param location - The DOM node that the nodes created by the `IViewFactory` should be mounted to. Only applicable for template controllers. Used by all built-in template controllers.
   */
  getComponentFactory(
    parentController?: IController,
    host?: INode,
    instruction?: IInstruction,
    viewFactory?: IViewFactory,
    location?: IRenderLocation,
    auSlotsInfo?: IAuSlotsInfo,
  ): IComponentFactory;

  render(
    flags: LifecycleFlags,
    controller: IController,
    targets: ArrayLike<INode>,
    templateDefinition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void;

  renderChildren(
    flags: LifecycleFlags,
    instructions: readonly IInstruction[],
    controller: IController,
    target: unknown,
  ): void;
}

/**
 * A compiled `IRenderContext` that is ready to be used for creating component instances, and composing them.
 */
export interface IComponentFactory extends ICompiledRenderContext, IDisposable {
  /**
   * Creates a new component instance based on the provided `resourceKey`.
   *
   * It is only safe to override the generic type argument if you know / own the component type associated with the name.
   *
   * @param resourceKey - The (full) resource key as returned from the `keyFrom` helper.
   *
   * @returns A new instance of the requested component. Will throw an error if the registration does not exist.
   *
   * @example
   *
   * ```ts
   * // Create a new instance of the 'au-compose' custom element
   * const elementInstance = factory.createComponent<Compose>(CustomElement.keyFrom('au-compose'));
   *
   * // Create a new instance of the 'if' template controller
   * const attributeInstance = factory.createComponent<If>(CustomAttribute.keyFrom('if'));
   *
   * // Dynamically create a new instance of a custom element
   * const attributeInstance = factory.createComponent(CustomElement.keyFrom(name));
   * ```
   */
  createComponent<TViewModel = ICustomAttributeViewModel | ICustomElementViewModel>(resourceKey: string): TViewModel;

  /**
   * Release any resources that were stored by `getComponentFactory()`.
   */
  dispose(): void;
}

export function getRenderContext(
  partialDefinition: PartialCustomElementDefinition,
  parentContainer: IContainer,
  projections?: IProjections | null,
): IRenderContext {
  const definition = CustomElementDefinition.getOrCreate(partialDefinition);

  // injectable completely prevents caching, ensuring that each instance gets a new context context
  if (definition.injectable !== null) {
    return new RenderContext(definition, parentContainer);
  }

  if (projections == null) {
    let containerLookup = definitionContainerLookup.get(definition);
    if (containerLookup === void 0) {
      definitionContainerLookup.set(
        definition,
        containerLookup = new WeakMap(),
      );
    }

    let context = containerLookup.get(parentContainer);
    if (context === void 0) {
      containerLookup.set(
        parentContainer,
        context = new RenderContext(definition, parentContainer),
      );
    }

    return context;
  }

  let containerProjectionsLookup = definitionContainerProjectionsLookup.get(definition);
  if (containerProjectionsLookup === void 0) {
    definitionContainerProjectionsLookup.set(
      definition,
      containerProjectionsLookup = new WeakMap(),
    );
  }

  let projectionsLookup = containerProjectionsLookup.get(parentContainer);
  if (projectionsLookup === void 0) {
    containerProjectionsLookup.set(
      parentContainer,
      projectionsLookup = new WeakMap(),
    );
  }

  let context = projectionsLookup.get(projections);
  if (context === void 0) {
    projectionsLookup.set(
      projections,
      context = new RenderContext(definition, parentContainer),
    );
  }

  return context;
}

const emptyNodeCache = new WeakMap<IPlatform, FragmentNodeSequence>();

export class RenderContext implements IComponentFactory {
  public get id(): number {
    return this.container.id;
  }

  public readonly root: IContainer;
  private readonly container: IContainer;

  private readonly parentControllerProvider: InstanceProvider<IController>;
  private readonly elementProvider: InstanceProvider<HTMLElement>;
  private readonly instructionProvider: InstanceProvider<Instruction>;
  private readonly factoryProvider: ViewFactoryProvider;
  private readonly renderLocationProvider: InstanceProvider<IRenderLocation>;
  private readonly auSlotsInfoProvider: InstanceProvider<IAuSlotsInfo>;

  private viewModelProvider: InstanceProvider<ICustomElementViewModel> | undefined = void 0;
  private fragment: Node | null = null;
  private factory: IViewFactory | undefined = void 0;
  private isCompiled: boolean = false;

  public readonly platform: IPlatform;
  private readonly renderers: Record<InstructionTypeName, IRenderer> = Object.create(null);

  public compiledDefinition: CustomElementDefinition = (void 0)!;

  public constructor(
    public readonly definition: CustomElementDefinition,
    public readonly parentContainer: IContainer,
  ) {
    this.root = parentContainer.root;
    const container = this.container = parentContainer.createChild();
    // TODO(fkleuver): get contextual + root renderers
    const renderers = container.getAll(IRenderer);
    let i = 0;
    let renderer: IRenderer;
    for (; i < renderers.length; ++i) {
      renderer = renderers[i];
      this.renderers[renderer.instructionType as string] = renderer;
    }

    container.registerResolver(
      IViewFactory,
      this.factoryProvider = new ViewFactoryProvider(),
      true,
    );
    container.registerResolver(
      IController,
      this.parentControllerProvider = new InstanceProvider('IController'),
      true,
    );
    container.registerResolver(
      IInstruction,
      this.instructionProvider = new InstanceProvider<Instruction>('IInstruction'),
      true,
    );
    container.registerResolver(
      IRenderLocation,
      this.renderLocationProvider = new InstanceProvider<IRenderLocation>('IRenderLocation'),
      true,
    );
    container.registerResolver(
      IAuSlotsInfo,
      this.auSlotsInfoProvider = new InstanceProvider<IAuSlotsInfo>('IAuSlotsInfo'),
      true,
    );
    const p = this.platform = container.get(IPlatform);
    const ep = this.elementProvider = new InstanceProvider('ElementResolver');
    container.registerResolver(INode, ep);
    container.registerResolver(p.Node, ep);
    container.registerResolver(p.Element, ep);
    container.registerResolver(p.HTMLElement, ep);

    container.register(...definition.dependencies);
  }

  // #region IServiceLocator api
  public has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean {
    return this.container.has(key, searchAncestors);
  }

  public get<K extends Key>(key: K | Key): Resolved<K> {
    return this.container.get(key);
  }

  public getAll<K extends Key>(key: K | Key): readonly Resolved<K>[] {
    return this.container.getAll(key);
  }
  // #endregion

  // #region IContainer api
  public register(...params: unknown[]): IContainer {
    return this.container.register(...params);
  }

  public registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T> {
    return this.container.registerResolver(key, resolver);
  }

  // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
  //   this.container.deregisterResolverFor(key);
  // }

  public registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean {
    return this.container.registerTransformer(key, transformer);
  }

  public getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null {
    return this.container.getResolver(key, autoRegister);
  }

  public invoke<T, TDeps extends unknown[] = unknown[]>(key: Constructable<T>, dynamicDependencies?: TDeps): T {
    return this.container.invoke(key, dynamicDependencies);
  }

  public getFactory<T extends Constructable>(key: T): IFactory<T> {
    return this.container.getFactory(key);
  }

  public registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void {
    this.container.registerFactory(key, factory);
  }

  public createChild(): IContainer {
    return this.container.createChild();
  }

  public find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
    return this.container.find(kind, name);
  }

  public create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null {
    return this.container.create(kind, name);
  }

  public disposeResolvers() {
    this.container.disposeResolvers();
  }
  // #endregion

  // #region IRenderContext api
  public compile(compilationInstruction: ICompliationInstruction | null): ICompiledRenderContext {
    let compiledDefinition: CustomElementDefinition;
    if (this.isCompiled) {
      return this;
    }
    this.isCompiled = true;

    const definition = this.definition;
    if (definition.needsCompile) {
      const container = this.container;
      const compiler = container.get(ITemplateCompiler);

      compiledDefinition = this.compiledDefinition = compiler.compile(definition, container, compilationInstruction);
    } else {
      compiledDefinition = this.compiledDefinition = definition;
    }

    // Support Recursive Components by adding self to own context
    compiledDefinition.register(this);

    if (fragmentCache.has(compiledDefinition)) {
      this.fragment = fragmentCache.get(compiledDefinition)!;
    } else {
      const doc = this.platform.document;
      const template = compiledDefinition.template;
      if (template === null || this.definition.enhance === true) {
        this.fragment = null;
      } else if (template instanceof this.platform.Node) {
        if (template.nodeName === 'TEMPLATE') {
          this.fragment = doc.adoptNode((template as HTMLTemplateElement).content);
        } else {
          (this.fragment = doc.adoptNode(doc.createDocumentFragment())).appendChild(template);
        }
      } else {
        const tpl = doc.createElement('template');
        doc.adoptNode(tpl.content);
        if (typeof template === 'string') {
          tpl.innerHTML = template;
        }
        this.fragment = tpl.content;
      }
      fragmentCache.set(compiledDefinition, this.fragment);
    }

    return this;
  }

  public getViewFactory(name?: string): IViewFactory {
    let factory = this.factory;
    if (factory === void 0) {
      if (name === void 0) {
        name = this.definition.name;
      }
      factory = this.factory = new ViewFactory(name, this);
    }
    return factory;
  }

  public beginChildComponentOperation(instance: ICustomElementViewModel): IRenderContext {
    const definition = this.definition;
    if (definition.injectable !== null) {
      if (this.viewModelProvider === void 0) {
        this.container.registerResolver(
          definition.injectable,
          this.viewModelProvider = new InstanceProvider<ICustomElementViewModel>('definition.injectable'),
        );
      }
      this.viewModelProvider!.prepare(instance);
    }

    return this;
  }

  // #endregion

  // #region ICompiledRenderContext api

  public createNodes(): INodeSequence {
    if (this.compiledDefinition.enhance === true) {
      return new FragmentNodeSequence(this.platform, this.compiledDefinition.template as DocumentFragment);
    }
    if (this.fragment === null) {
      let emptyNodes = emptyNodeCache.get(this.platform);
      if (emptyNodes === void 0) {
        emptyNodeCache.set(this.platform, emptyNodes = new FragmentNodeSequence(this.platform, this.platform.document.createDocumentFragment()));
      }
      return emptyNodes;
    }
    return new FragmentNodeSequence(this.platform, this.fragment.cloneNode(true) as DocumentFragment);
  }

  // TODO: split up into 2 methods? getComponentFactory + getSyntheticFactory or something
  public getComponentFactory(
    parentController?: IController,
    host?: HTMLElement,
    instruction?: Instruction,
    viewFactory?: IViewFactory,
    location?: IRenderLocation,
    auSlotsInfo?: IAuSlotsInfo,
  ): IComponentFactory {
    if (parentController !== void 0) {
      this.parentControllerProvider.prepare(parentController);
    }
    if (host !== void 0) {
      // TODO: fix provider input type, Key is probably not a good constraint
      this.elementProvider.prepare(host);
    }
    if (instruction !== void 0) {
      this.instructionProvider.prepare(instruction);
    }
    if (location !== void 0) {
      this.renderLocationProvider.prepare(location);
    }
    if (viewFactory !== void 0) {
      this.factoryProvider.prepare(viewFactory);
    }
    if (auSlotsInfo !== void 0) {
      this.auSlotsInfoProvider.prepare(auSlotsInfo);
    }

    return this;
  }
  // #endregion

  // #region IComponentFactory api

  public createComponent<TViewModel = ICustomElementViewModel>(resourceKey: string): TViewModel {
    return this.container.get(resourceKey) as unknown as TViewModel;
  }

  public render(
    flags: LifecycleFlags,
    controller: IHydratableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void {
    if (targets.length !== definition.instructions.length) {
      throw new Error(`The compiled template is not aligned with the render instructions. There are ${targets.length} targets and ${definition.instructions.length} instructions.`);
    }

    for (let i = 0; i < targets.length; ++i) {
      this.renderChildren(
        /* flags        */flags,
        /* instructions */definition.instructions[i],
        /* controller   */controller,
        /* target       */targets[i],
      );
    }

    if (host !== void 0 && host !== null) {
      this.renderChildren(
        /* flags        */flags,
        /* instructions */definition.surrogates,
        /* controller   */controller,
        /* target       */host,
      );
    }
  }

  public renderChildren(
    flags: LifecycleFlags,
    instructions: readonly IInstruction[],
    controller: IHydratableController,
    target: unknown,
  ): void {
    for (let i = 0; i < instructions.length; ++i) {
      const current = instructions[i];
      this.renderers[current.type].render(flags, this, controller, target, current);
    }
  }

  public dispose(): void {
    this.elementProvider.dispose();
  }
  // #endregion
}

/** @internal */
export class ViewFactoryProvider implements IResolver {
  private factory: IViewFactory | null = null;

  public prepare(factory: IViewFactory): void {
    this.factory = factory;
  }
  public get $isResolver(): true { return true; }

  public resolve(_handler: IContainer, _requestor: IContainer): IViewFactory {
    const factory = this.factory;
    if (factory === null) {
      throw new Error('Cannot resolve ViewFactory before the provider was prepared.');
    }
    if (typeof factory.name !== 'string' || factory.name.length === 0) {
      throw new Error('Cannot resolve ViewFactory without a (valid) name.');
    }
    return factory;
  }

  public dispose(): void {
    this.factory = null;
  }
}
