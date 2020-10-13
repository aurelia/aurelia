import {
  Constructable,
  IContainer,
  IDisposable,
  IFactory,
  InstanceProvider,
  IResolver,
  Key,
  Resolved,
  Transformer,
} from '@aurelia/kernel';
import {
  ITargetedInstruction,
} from '../definitions';
import { IDOM, INode, INodeSequence, IRenderLocation } from '../dom';
import { LifecycleFlags } from '../flags';
import {
  IController,
  ICustomAttributeViewModel,
  ICustomElementViewModel,
  ILifecycle,
  IComposableController,
  IViewFactory,
} from '../lifecycle';
import { IComposer, ITemplateCompiler } from '../composer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
import { ViewFactory } from './view';
import { AuSlotContentType, IProjectionProvider, RegisteredProjections } from '../resources/custom-elements/au-slot';

import type { Scope } from '../observation/binding-context';

const definitionContainerLookup = new WeakMap<CustomElementDefinition, WeakMap<IContainer, CompositionContext>>();
const definitionContainerProjectionsLookup = new WeakMap<CustomElementDefinition, WeakMap<IContainer, WeakMap<Record<string, CustomElementDefinition>, CompositionContext>>>();

const fragmentCache = new WeakMap<CustomElementDefinition, INode | null>();

export function isCompositionContext<T extends INode = INode>(value: unknown): value is ICompositionContext<T> {
  return value instanceof CompositionContext;
}

/**
 * A composition context that wraps an `IContainer` and must be compiled before it can be used for composing.
 */
export interface ICompositionContext<T extends INode = INode> extends IContainer {
  readonly dom: IDOM<T>;

  /**
   * The `CustomElementDefinition` that this `ICompositionContext` was created with.
   *
   * If a `PartialCustomElementDefinition` was used to create this context, then this property will be the return value of `CustomElementDefinition.getOrCreate`.
   */
  readonly definition: CustomElementDefinition;

  /**
   * The `IContainer` (which may be, but is not guaranteed to be, an `ICompositionContext`) that this `ICompositionContext` was created with.
   */
  readonly parentContainer: IContainer;

  /**
   * Prepare this factory for creating child controllers. Only applicable for custom elements.
   *
   * @param instance - The component instance to make available to child components if this context's definition has `injectable` set to `true`.
   */
  beginChildComponentOperation(instance: ICustomElementViewModel): ICompositionContext<T>;

  /**
   * Compiles the backing `CustomElementDefinition` (if needed) and returns the compiled `ICompositionContext` that exposes the compiled `CustomElementDefinition` as well as composing operations.
   *
   * This operation is idempotent.
   *
   * @returns The compiled `ICompositionContext`.
   */
  compile(targetedProjections: RegisteredProjections | null): ICompiledCompositionContext<T>;

  /**
   * Creates an (or returns the cached) `IViewFactory` that can be used to create synthetic view controllers.
   *
   * @returns Either a new `IViewFactory` (if this is the first call), or a cached one.
   */
  getViewFactory(name?: string, contentType?: AuSlotContentType, projectionScope?: Scope | null): IViewFactory<T>;
}

/**
 * A compiled `ICompositionContext` that can create instances of `INodeSequence` (based on the template of the compiled definition)
 * and begin a component operation to create new component instances.
 */
export interface ICompiledCompositionContext<T extends INode = INode> extends ICompositionContext<T>, IProjectionProvider {
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
  createNodes(): INodeSequence<T>;

  /**
   * Prepare this composition context for creating a new component instance.
   *
   * All parameters are optional injectable dependencies, that is: only those that are actually needed by the to-be-created component, need to be provided in order for that component to work.
   *
   * To avoid possible memory leaks, don't forget to call `dispose()` on the returned `IComponentFactory` after creating a component.
   *
   * @param parentController - The `IController` of the immediate parent of the to-be-created component. Not used by any built-in components.
   * @param host - The DOM node that declared the component, or the node that the component will be mounted to (in case of containerless). Used by some built-in custom attributes.
   * @param instruction - The hydrate instruction that resulted in the creation of this composition context. Only used by `au-compose`.
   * @param viewFactory - The `IViewFactory` that was created from the template that the template controller was placed on. Only applicable for template controllers. Used by all built-in template controllers.
   * @param location - The DOM node that the nodes created by the `IViewFactory` should be mounted to. Only applicable for template controllers. Used by all built-in template controllers.
   */
  getComponentFactory(
    parentController?: IController,
    host?: INode,
    instruction?: ITargetedInstruction,
    viewFactory?: IViewFactory,
    location?: IRenderLocation,
  ): IComponentFactory<T>;

  compose(
    flags: LifecycleFlags,
    controller: IController,
    targets: ArrayLike<INode>,
    templateDefinition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void;

  composeChildren(
    flags: LifecycleFlags,
    instructions: readonly ITargetedInstruction[],
    controller: IController,
    target: unknown,
  ): void;
}

/**
 * A compiled `ICompositionContext` that is ready to be used for creating component instances, and composing them.
 */
export interface IComponentFactory<T extends INode = INode> extends ICompiledCompositionContext<T>, IDisposable {
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
  createComponent<TViewModel = ICustomAttributeViewModel<T> | ICustomElementViewModel<T>>(resourceKey: string): TViewModel;

  /**
   * Release any resources that were stored by `getComponentFactory()`.
   */
  dispose(): void;
}

export function getCompositionContext<T extends INode = INode>(
  partialDefinition: PartialCustomElementDefinition,
  parentContainer: IContainer,
  projections?: Record<string, CustomElementDefinition> | null,
): ICompositionContext<T> {
  const definition = CustomElementDefinition.getOrCreate(partialDefinition);

  // injectable completely prevents caching, ensuring that each instance gets a new composition context
  if (definition.injectable !== null) {
    return new CompositionContext<T>(definition, parentContainer);
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
        context = new CompositionContext<T>(definition, parentContainer),
      );
    }

    return context as unknown as ICompositionContext<T>;
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
      context = new CompositionContext<T>(definition, parentContainer),
    );
  }

  return context as unknown as ICompositionContext<T>;
}

export class CompositionContext<T extends INode = INode> implements IComponentFactory<T> {
  private readonly container: IContainer;

  private readonly parentControllerProvider: InstanceProvider<IController<T>>;
  private readonly elementProvider: InstanceProvider<T>;
  private readonly instructionProvider: InstanceProvider<ITargetedInstruction>;
  private readonly factoryProvider: ViewFactoryProvider<T>;
  private readonly renderLocationProvider: InstanceProvider<IRenderLocation<T>>;

  private viewModelProvider: InstanceProvider<ICustomElementViewModel<T>> | undefined = void 0;
  private fragment: T | null = null;
  private factory: IViewFactory<T> | undefined = void 0;
  private isCompiled: boolean = false;

  private readonly projectionProvider: IProjectionProvider;
  public readonly composer: IComposer;
  public readonly dom: IDOM<T>;

  public compiledDefinition: CustomElementDefinition = (void 0)!;

  public constructor(
    public readonly definition: CustomElementDefinition,
    public readonly parentContainer: IContainer,
  ) {
    const container = this.container = parentContainer.createChild();
    this.composer = container.get(IComposer);
    this.projectionProvider = container.get(IProjectionProvider);

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
      ITargetedInstruction,
      this.instructionProvider = new InstanceProvider<ITargetedInstruction>('ITargetedInstruction'),
      true,
    );
    container.registerResolver(
      IRenderLocation,
      this.renderLocationProvider = new InstanceProvider<IRenderLocation>('IRenderLocation'),
      true,
    );

    (this.dom = container.get<IDOM<T>>(IDOM)).registerElementResolver(
      container,
      this.elementProvider = new InstanceProvider('ElementResolver'),
    );
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

  public getFactory<T extends Constructable>(key: T): IFactory<T> | null {
    return this.container.getFactory(key);
  }

  public registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void {
    this.container.registerFactory(key, factory);
  }

  public createChild(): IContainer {
    return this.container.createChild();
  }

  public disposeResolvers() {
    this.container.disposeResolvers();
  }
  // #endregion

  // #region ICompositionContext api
  public compile(targetedProjections: RegisteredProjections | null): ICompiledCompositionContext<T> {
    let compiledDefinition: CustomElementDefinition;
    if (this.isCompiled) {
      return this;
    }
    this.isCompiled = true;

    const definition = this.definition;
    if (definition.needsCompile) {
      const container = this.container;
      const compiler = container.get(ITemplateCompiler);

      compiledDefinition = this.compiledDefinition = compiler.compile(definition, container, targetedProjections);
    } else {
      compiledDefinition = this.compiledDefinition = definition;
    }

    // Support Recursive Components by adding self to own context
    compiledDefinition.register(this);

    if (fragmentCache.has(compiledDefinition)) {
      this.fragment = fragmentCache.get(compiledDefinition) as T;
    } else {
      const template = compiledDefinition.template as string | T | null;
      if (template === null) {
        fragmentCache.set(compiledDefinition, null);
      } else {
        fragmentCache.set(
          compiledDefinition,
          this.fragment = this.definition.enhance ? template as T : this.dom.createDocumentFragment(template),
        );
      }
    }

    return this;
  }

  public getViewFactory(name?: string, contentType?: AuSlotContentType, projectionScope?: Scope | null): IViewFactory<T> {
    let factory = this.factory;
    if (factory === void 0) {
      if (name === void 0) {
        name = this.definition.name;
      }
      const lifecycle = this.parentContainer.get(ILifecycle);
      factory = this.factory = new ViewFactory<T>(name, this, lifecycle, contentType, projectionScope);
    }
    return factory;
  }

  public beginChildComponentOperation(instance: ICustomElementViewModel): ICompositionContext<T> {
    const definition = this.definition;
    if (definition.injectable !== null) {
      if (this.viewModelProvider === void 0) {
        this.container.registerResolver(
          definition.injectable,
          this.viewModelProvider = new InstanceProvider<ICustomElementViewModel<T>>('definition.injectable'),
        );
      }
      this.viewModelProvider!.prepare(instance as ICustomElementViewModel<T>);
    }

    return this;
  }

  // #endregion

  // #region ICompiledCompositionContext api

  public createNodes(): INodeSequence<T> {
    return this.dom.createNodeSequence(this.fragment, !this.definition.enhance);
  }

  // TODO: split up into 2 methods? getComponentFactory + getSyntheticFactory or something
  public getComponentFactory(
    parentController?: IController,
    host?: INode,
    instruction?: ITargetedInstruction,
    viewFactory?: IViewFactory,
    location?: IRenderLocation,
  ): IComponentFactory<T> {
    if (parentController !== void 0) {
      this.parentControllerProvider.prepare(parentController as IController<T>);
    }
    if (host !== void 0) {
      // TODO: fix provider input type, Key is probably not a good constraint
      this.elementProvider.prepare(host as Resolved<T>);
    }
    if (instruction !== void 0) {
      this.instructionProvider.prepare(instruction);
    }
    if (location !== void 0) {
      this.renderLocationProvider.prepare(location as IRenderLocation<T>);
    }
    if (viewFactory !== void 0) {
      this.factoryProvider.prepare(viewFactory as IViewFactory<T>);
    }

    return this;
  }
  // #endregion

  // #region IComponentFactory api

  public createComponent<TViewModel = ICustomElementViewModel<T>>(resourceKey: string): TViewModel {
    return this.container.get(resourceKey) as unknown as TViewModel;
  }

  public compose(
    flags: LifecycleFlags,
    controller: IComposableController,
    targets: ArrayLike<INode>,
    templateDefinition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void {
    this.composer.compose(flags, this, controller, targets, templateDefinition, host);
  }

  public composeChildren(
    flags: LifecycleFlags,
    instructions: readonly ITargetedInstruction[],
    controller: IComposableController,
    target: unknown,
  ): void {
    this.composer.composeChildren(flags, this, instructions, controller, target);
  }

  public dispose(): void {
    this.elementProvider.dispose();
  }
  // #endregion

  // #region IProjectionProvider api
  public registerProjections(projections: Map<ITargetedInstruction, Record<string, CustomElementDefinition>>, scope: Scope): void {
    this.projectionProvider.registerProjections(projections, scope);
  }

  public getProjectionFor(instruction: ITargetedInstruction): RegisteredProjections | null {
    return this.projectionProvider.getProjectionFor(instruction);
  }
  // #endregion
}

/** @internal */
export class ViewFactoryProvider<T extends INode = INode> implements IResolver {
  private factory: IViewFactory<T> | null = null;

  public prepare(factory: IViewFactory<T>): void {
    this.factory = factory;
  }
  public get $isResolver(): true { return true; }

  public resolve(_handler: IContainer, _requestor: IContainer): IViewFactory<T> {
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
