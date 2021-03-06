import { FragmentNodeSequence, INode, INodeSequence } from '../dom.js';
import { IRenderer, ITemplateCompiler, IInstruction, ICompliationInstruction } from '../renderer.js';
import { CustomElementDefinition } from '../resources/custom-element.js';
import { IViewFactory, ViewFactory } from './view.js';
import { IPlatform } from '../platform.js';
import { IController } from './controller.js';

import type { IContainer } from '@aurelia/kernel';
import type { LifecycleFlags } from '@aurelia/runtime';
import type { IHydratableController } from './controller.js';
import type { InstructionTypeName } from '../renderer.js';
import type { PartialCustomElementDefinition } from '../resources/custom-element.js';

const definitionContainerLookup = new WeakMap<CustomElementDefinition, WeakMap<IContainer, RenderContext>>();
const fragmentCache = new WeakMap<CustomElementDefinition, Node | null>();

export function isRenderContext(value: unknown): value is IRenderContext {
  return value instanceof RenderContext;
}

/**
 * A render context that wraps an `IContainer` and must be compiled before it can be used for composing.
 */
export interface IRenderContext {
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
  // readonly parentContainer: IContainer;

  readonly container: IContainer;

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

let renderContextCount = 0;
export function getRenderContext(
  partialDefinition: PartialCustomElementDefinition,
  container: IContainer,
): IRenderContext {
  const definition = CustomElementDefinition.getOrCreate(partialDefinition);

  let containerLookup = definitionContainerLookup.get(definition);
  if (containerLookup === void 0) {
    definitionContainerLookup.set(
      definition,
      containerLookup = new WeakMap(),
    );
  }

  let context = containerLookup.get(container);
  if (context === void 0) {
    containerLookup.set(
      container,
      context = new RenderContext(definition, container),
    );
  }

  return context;
}
getRenderContext.count = 0;
// A simple counter for debugging purposes only
Reflect.defineProperty(getRenderContext, 'count', {
  get: () => renderContextCount
});

const emptyNodeCache = new WeakMap<IPlatform, FragmentNodeSequence>();
const getRenderersSymb = Symbol();
const compiledDefCache = new WeakMap<IContainer, WeakMap<PartialCustomElementDefinition, CustomElementDefinition>>();

export class RenderContext implements ICompiledRenderContext {
  public get id(): number {
    return this.container.id;
  }

  public readonly root: IContainer;
  public readonly container: IContainer;

  private fragment: Node | null = null;
  private factory: IViewFactory | undefined = void 0;
  private isCompiled: boolean = false;

  public readonly platform: IPlatform;
  private readonly renderers: Record<InstructionTypeName, IRenderer> = Object.create(null);

  public compiledDefinition: CustomElementDefinition = (void 0)!;

  public constructor(
    public readonly definition: CustomElementDefinition,
    container: IContainer,
  ) {
    ++renderContextCount;
    this.container = container;
    // note: it's incorrect to get rendereres only from root,
    //       as they could also be considered normal resources
    //       though it's highly practical for limiting renderers to the global scope
    const renderers = (container.root as any)[getRenderersSymb] ??= container.root.getAll(IRenderer);
    let i = 0;
    let renderer: IRenderer;
    for (; i < renderers.length; ++i) {
      renderer = renderers[i];
      this.renderers[renderer.instructionType as string] = renderer;
    }

    this.root = container.root;
    this.platform = container.get(IPlatform);
  }

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
      let compiledMap = compiledDefCache.get(container.root);
      if (compiledMap == null) {
        compiledDefCache.set(container.root, compiledMap = new WeakMap());
      }
      let compiled = compiledMap.get(definition);
      if (compiled == null) {
        compiledMap.set(definition, compiled = compiler.compile(definition, container, compilationInstruction));
      } else {
        container.register(...compiled.dependencies);
      }
      compiledDefinition = this.compiledDefinition = compiled;
    } else {
      compiledDefinition = this.compiledDefinition = definition;
    }

    // Support Recursive Components by adding self to own context
    compiledDefinition.register(this.container);

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
  // #endregion

  // public create

  // #region IComponentFactory api

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
    throw new Error('Cannot dispose a render context');
  }
  // #endregion
}
