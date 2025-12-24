import { createLookup, isString, IContainer, resolve } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/expression-parser';
import { IObserverLocator } from '@aurelia/runtime';

import { ISSRContext, type ISSRScope } from './ssr';

import { FragmentNodeSequence, INodeSequence } from '../dom';
import { INode } from '../dom.node';
import { IPlatform } from '../platform';
import { IRenderer } from '../renderer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
import { IViewFactory, ViewFactory } from './view';
import type { IHydratableController } from './controller';
import { createInterface } from '../utilities-di';
import { ErrorNames, createMappedError } from '../errors';
import { IInstruction, ITemplateCompiler, itHydrateElement, itHydrateTemplateController } from '@aurelia/template-compiler';

export const IRendering = /*@__PURE__*/createInterface<IRendering>('IRendering', x => x.singleton(Rendering));
export interface IRendering {
  get renderers(): Record<number, IRenderer>;

  compile(
    definition: CustomElementDefinition,
    container: IContainer,
  ): CustomElementDefinition;

  getViewFactory(definition: PartialCustomElementDefinition, container: IContainer): IViewFactory;

  createNodes(definition: CustomElementDefinition): INodeSequence;

  /**
   * Adopt existing DOM children for SSR hydration.
   *
   * Instead of cloning from a template, this wraps existing DOM nodes
   * that were pre-rendered (e.g., by SSR). The nodes stay in place.
   *
   * @param host - The element whose children should be adopted
   * @returns A node sequence wrapping the existing children
   */
  adoptNodes(host: Element): INodeSequence;

  render(
    controller: IHydratableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void;
}

export class Rendering implements IRendering {
  /** @internal */
  private readonly _ctn: IContainer;
  /** @internal */
  private readonly _exprParser: IExpressionParser;
  /** @internal */
  private readonly _observerLocator: IObserverLocator;
  /** @internal */
  private _renderers: Record<number, IRenderer> | undefined;
  /** @internal */
  private readonly _platform: IPlatform;
  /** @internal */
  private readonly _compilationCache: WeakMap<PartialCustomElementDefinition, CustomElementDefinition> = new WeakMap();
  /** @internal */
  private readonly _fragmentCache: WeakMap<CustomElementDefinition, DocumentFragment | null> = new WeakMap();
  /** @internal */
  private readonly _empty: INodeSequence;
  /** @internal */
  private readonly _preserveMarkers: boolean;

  public get renderers(): Record<number, IRenderer> {
    return this._renderers ??= this._ctn.getAll(IRenderer, false).reduce((all, r) => {
      if (__DEV__) {
        if (all[r.target] !== void 0) {
          // eslint-disable-next-line no-console
          console.warn(`[DEV:aurelia] Renderer for target ${r.target} already exists.`);
        }
      }
      all[r.target] ??= r;
      return all;
    }, createLookup<IRenderer>());
  }

  public constructor() {
    const ctn = this._ctn = resolve(IContainer).root;
    const p = this._platform = ctn.get(IPlatform);
    this._exprParser= ctn.get(IExpressionParser);
    this._observerLocator = ctn.get(IObserverLocator);
    this._empty = new FragmentNodeSequence(p, p.document.createDocumentFragment());
    this._preserveMarkers = ctn.has(ISSRContext, true) ? ctn.get(ISSRContext).preserveMarkers : false;
  }

  public compile(
    definition: CustomElementDefinition,
    container: IContainer,
  ): CustomElementDefinition {
    const compiler = container.get(ITemplateCompiler);
    const compiledMap = this._compilationCache;
    let compiled = compiledMap.get(definition);
    if (compiled == null) {
      compiledMap.set(definition, compiled = CustomElementDefinition.create(
        definition.needsCompile
          ? compiler.compile(
            definition,
            container,
          )
          : definition
      ));
    }
    return compiled;
  }

  public getViewFactory(definition: PartialCustomElementDefinition, container: IContainer): IViewFactory {
    return new ViewFactory(container, CustomElementDefinition.getOrCreate(definition));
  }

  public createNodes(definition: CustomElementDefinition): INodeSequence {
    if (definition.enhance === true) {
      return new FragmentNodeSequence(this._platform, definition.template as DocumentFragment);
    }
    let fragment: DocumentFragment | null | undefined;
    let needsImportNode = false;
    const cache = this._fragmentCache;
    const p = this._platform;
    const doc = p.document;
    if (cache.has(definition)) {
      fragment = cache.get(definition);
    } else {
      const template = definition.template;
      let tpl: HTMLTemplateElement;
      if (template == null) {
        fragment = null;
      } else if (template instanceof p.Node) {
        if (template.nodeName === 'TEMPLATE') {
          fragment = (template as HTMLTemplateElement).content;
          needsImportNode = true;
        } else {
          (fragment = doc.createDocumentFragment()).appendChild(template.cloneNode(true));
        }
      } else {
        tpl = doc.createElement('template');
        if (isString(template)) {
          tpl.innerHTML = template;
        }
        fragment = tpl.content;
        needsImportNode = true;
      }
      // No marker transformation needed - <!--au--> markers are used directly
      // and targets are found via comment text matching

      cache.set(definition, fragment);
    }

    if (fragment == null) {
      return this._empty;
    }

    // Clone the fragment for this view
    const clonedFragment = needsImportNode
      ? doc.importNode(fragment, true)
      : doc.adoptNode(fragment.cloneNode(true) as DocumentFragment);

    return new FragmentNodeSequence(
      this._platform,
      clonedFragment,
      this._preserveMarkers,
    );
  }

  public adoptNodes(host: Element): INodeSequence {
    return FragmentNodeSequence.adoptChildren(this._platform, host);
  }

  public render(
    controller: IHydratableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void {
    const rows = definition.instructions;
    const renderers = this.renderers;
    const targetCount = targets.length;
    const rowCount = rows.length;

    // Tree-based SSR: get parent's scope and track child index
    const parentScope = controller.ssrScope as ISSRScope | undefined;
    const isHydrating = parentScope != null;
    const scopeChildren = parentScope?.children;
    let ssrChildIndex = 0;

    let i = 0;
    let j = 0;
    let jj = rowCount;
    let row: readonly IInstruction[];
    let instruction: IInstruction;
    let target: INode;

    if (!isHydrating && targetCount !== rowCount) {
      throw createMappedError(ErrorNames.rendering_mismatch_length, targetCount, rowCount);
    }

    // host is only null when rendering a synthetic view
    // but we have a check here so that we dont need to read surrogates unnecessarily
    if (host != null) {
      row = definition.surrogates;
      if ((jj = row.length) > 0) {
        j = 0;
        while (jj > j) {
          instruction = row[j];
          renderers[instruction.type].render(controller, host, instruction, this._platform, this._exprParser, this._observerLocator);
          ++j;
        }
      }
    }

    if (rowCount > 0) {
      while (rowCount > i) {
        row = rows[i];
        target = targets[i];

        j = 0;
        jj = row.length;
        while (jj > j) {
          instruction = row[j];

          // Tree-based SSR: pass scope child to child-creating instructions
          const instructionType = instruction.type;
          const createsChild = instructionType === itHydrateTemplateController || instructionType === itHydrateElement;
          const childScope = createsChild && scopeChildren != null
            ? scopeChildren[ssrChildIndex++]
            : undefined;

          renderers[instructionType].render(controller, target, instruction, this._platform, this._exprParser, this._observerLocator, childScope);
          ++j;
        }
        ++i;
      }
    }
  }
}
