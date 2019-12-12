import { CustomElementDefinition } from '../resources/custom-element';
import { PartialCustomElementDefinitionParts, ITargetedInstruction } from '../definitions';
import { IContainer, InstanceProvider, Key, Resolved, IResolver, Constructable, IFactory, IDisposable, RuntimeCompilationResources, Transformer, Reporter } from '@aurelia/kernel';
import { IController, IViewFactory, IViewModel, ILifecycle } from '../lifecycle';
import { IDOM, INode, IRenderLocation, INodeSequence } from '../dom';
import { IRenderer, ITemplateCompiler, ViewCompileFlags } from '../renderer';
import { ViewFactory } from './view';

// definition-to-parentContainerToContextCache-Cache :)
const definitionToPCTCCCache = new WeakMap<CustomElementDefinition, WeakMap<IContainer, RenderContext>>();
const fragmentCache = new WeakMap<CustomElementDefinition, INode | undefined>();

export class RenderContext implements IContainer {
  private readonly container: IContainer;

  private readonly parentControllerProvider: InstanceProvider<IController>;
  private readonly elementProvider: InstanceProvider<INode>;
  private readonly instructionProvider: InstanceProvider<ITargetedInstruction>;
  private readonly factoryProvider: ViewFactoryProvider;
  private readonly renderLocationProvider: InstanceProvider<IRenderLocation>;
  private viewModelProvider: InstanceProvider<IViewModel> | undefined = void 0;

  public readonly renderer: IRenderer;
  public readonly dom: IDOM;

  private compiledDefinition: CustomElementDefinition | undefined = void 0;
  private fragment: INode | undefined = void 0;
  private factory: IViewFactory | undefined = void 0;
  private isCompiled: boolean = false;

  public constructor(
    private readonly definition: CustomElementDefinition,
    private readonly parentContainer: IContainer,
  ) {
    const container = this.container = parentContainer.createChild();
    this.renderer = container.get(IRenderer);

    container.registerResolver(
      IViewFactory,
      this.factoryProvider = new ViewFactoryProvider(),
    );
    container.registerResolver(
      IController,
      this.parentControllerProvider = new InstanceProvider(),
    );
    container.registerResolver(
      ITargetedInstruction,
      this.instructionProvider = new InstanceProvider<ITargetedInstruction>(),
    );
    container.registerResolver(
      IRenderLocation,
      this.renderLocationProvider = new InstanceProvider<IRenderLocation>(),
    );

    (this.dom = container.get(IDOM)).registerElementResolver(
      container,
      this.elementProvider = new InstanceProvider(),
    );
    container.register(...definition.dependencies);
  }

  public static getOrCreate(
    definition: CustomElementDefinition,
    parentContainer: IContainer,
  ): RenderContext {
    let parentContextToContextCache = definitionToPCTCCCache.get(definition);
    if (parentContextToContextCache === void 0) {
      definitionToPCTCCCache.set(
        definition,
        parentContextToContextCache = new WeakMap(),
      );
    }

    let context = parentContextToContextCache.get(parentContainer);
    if (context === void 0) {
      parentContextToContextCache.set(
        parentContainer,
        context = new RenderContext(definition, parentContainer),
      );
    }

    return context;
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
  public register(...params: any[]): IContainer {
    return this.container.register(...params);
  }

  public registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T> {
    return this.container.registerResolver(key, resolver);
  }

  public registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean {
    return this.container.registerTransformer(key, transformer);
  }

  public getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null {
    return this.container.getResolver(key, autoRegister);
  }

  public getFactory<T extends Constructable>(key: T): IFactory<T> | null {
    return this.container.getFactory(key);
  }

  public createChild(): IContainer {
    return this.container.createChild();
  }

  // #endregion

  /**
   * Compiles the backing `CustomElementDefinition` (if needed) and returns the compiled definition.
   *
   * After the first call to `compile()`, the compiled definition is cached and the same output will be returned on consecutive calls.
   *
   * This must be called *before* `createNodes()`
   *
   * @returns The compiled `CustomElementDefinition`.
   */
  public compile(): CustomElementDefinition {
    let compiledDefinition = this.compiledDefinition;
    if (this.isCompiled) {
      return compiledDefinition!;
    }
    this.isCompiled = true;

    const definition = this.definition;
    if (definition.needsCompile) {
      const container = this.container;
      const compiler = container.get(ITemplateCompiler);
      const resources = new RuntimeCompilationResources(container);

      compiledDefinition = this.compiledDefinition = compiler.compile(
        this.dom,
        definition,
        resources,
        ViewCompileFlags.surrogate,
      );
    } else {
      compiledDefinition = this.compiledDefinition = definition;
    }

    if (fragmentCache.has(compiledDefinition)) {
      this.fragment = fragmentCache.get(compiledDefinition);
    } else {
      const template = compiledDefinition.template as string | INode | null;
      if (template === null) {
        fragmentCache.set(compiledDefinition, void 0);
      } else {
        fragmentCache.set(
          compiledDefinition,
          this.fragment = this.dom.createDocumentFragment(template),
        );
      }
    }

    return compiledDefinition;
  }

  /**
   * Returns a new `INodeSequence` based on the document fragment from the compiled `CustomElementDefinition`.
   *
   * A new instance will be created from a clone of the fragment on each call.
   *
   * @returns An new instance of `INodeSequence` if there is a template, otherwise `null`. If `null` is returned, that means there is nothing to render.
   */
  public createNodes(): INodeSequence | null {
    const fragment = this.fragment;
    if (fragment === void 0) {
      return null;
    }
    return this.dom.createNodeSequence(fragment);
  }

  public getViewFactory(name?: string): IViewFactory {
    let factory = this.factory;
    if (factory === void 0) {
      if (name === void 0) {
        name = this.definition.name;
      }
      const lifecycle = this.parentContainer.get(ILifecycle);
      factory = this.factory = new ViewFactory(name, this, lifecycle);
    }
    return factory;
  }

  public beginComponentOperation(
    parentController: IController,
    target: INode,
    instruction: ITargetedInstruction,
    factory: IViewFactory | null,
    parts?: PartialCustomElementDefinitionParts,
    location?: IRenderLocation,
  ): IDisposable {
    this.parentControllerProvider.prepare(parentController);
    this.elementProvider.prepare(target);
    this.instructionProvider.prepare(instruction);

    if (factory) {
      this.factoryProvider.prepare(factory, parts!);
    }

    if (location) {
      this.renderLocationProvider.prepare(location);
    }

    return this;
  }

  // TODO: unify dispose / operation api in some way
  public beginChildComponentOperation(instance: IViewModel): void {
    const definition = this.definition;
    // Support Recursive Components by adding self to own context
    definition.register(this);
    if (definition.injectable !== null) {
      this.container.registerResolver(
        definition.injectable,
        this.viewModelProvider = new InstanceProvider<IViewModel>(),
      );
      this.viewModelProvider!.prepare(instance);
    }
  }

  public dispose(): void {
    this.factoryProvider.dispose();
    this.parentControllerProvider.dispose();
    this.instructionProvider.dispose();
    this.elementProvider.dispose();
    this.renderLocationProvider.dispose();
  }
}

/** @internal */
export class ViewFactoryProvider implements IResolver {
  private factory: IViewFactory | null = null;

  public prepare(factory: IViewFactory, parts?: PartialCustomElementDefinitionParts): void {
    this.factory = factory;
    if (parts !== void 0) {
      factory.addParts(parts);
    }
  }

  public resolve(handler: IContainer, requestor: RenderContext): IViewFactory {
    const factory = this.factory;
    if (factory === null) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
      throw Reporter.error(51); // TODO: organize error codes
    }
    const found = factory.parts[factory.name];
    if (found) {
      const definition = CustomElementDefinition.getOrCreate(found);
      const context = RenderContext.getOrCreate(definition, requestor);
      return context.getViewFactory(factory.name);
    }

    return factory;
  }

  public dispose(): void {
    this.factory = null;
  }
}
