import { FragmentNodeSequence, INodeSequence } from '../dom.js';
import { ITemplateCompiler, ICompliationInstruction } from '../renderer.js';
import { CustomElementDefinition } from '../resources/custom-element.js';
import { IViewFactory, ViewFactory } from './view.js';
import { IPlatform } from '../platform.js';

import type { IContainer } from '@aurelia/kernel';
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
}

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

const emptyNodeCache = new WeakMap<IPlatform, FragmentNodeSequence>();
const compiledDefCache = new WeakMap<IContainer, WeakMap<PartialCustomElementDefinition, CustomElementDefinition>>();

export class RenderContext implements ICompiledRenderContext {
  public readonly root: IContainer;
  public readonly container: IContainer;

  private fragment: Node | null = null;
  private factory: IViewFactory | undefined = void 0;
  private isCompiled: boolean = false;

  public readonly platform: IPlatform;

  public compiledDefinition: CustomElementDefinition = (void 0)!;

  public constructor(
    public readonly definition: CustomElementDefinition,
    container: IContainer,
  ) {
    this.container = container;
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

  public dispose(): void {
    throw new Error('Cannot dispose a render context');
  }
  // #endregion
}
