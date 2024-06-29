import { createLookup, isString, IContainer, resolve } from '@aurelia/kernel';
import { IExpressionParser } from '@aurelia/expression-parser';
import { IObserverLocator } from '@aurelia/runtime';

import { FragmentNodeSequence, INode, INodeSequence } from '../dom';
import { IPlatform } from '../platform';
import { IRenderer } from '../renderer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
import { IViewFactory, ViewFactory } from './view';
import type { IHydratableController } from './controller';
import { createInterface } from '../utilities-di';
import { ErrorNames, createMappedError } from '../errors';
import { IInstruction, ITemplateCompiler } from '@aurelia/template-compiler';

export const IRendering = /*@__PURE__*/createInterface<IRendering>('IRendering', x => x.singleton(Rendering));
export interface IRendering {
  get renderers(): Record<string, IRenderer>;

  compile(
    definition: CustomElementDefinition,
    container: IContainer,
  ): CustomElementDefinition;

  getViewFactory(definition: PartialCustomElementDefinition, container: IContainer): IViewFactory;

  createNodes(definition: CustomElementDefinition): INodeSequence;

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
  private _renderers: Record<string, IRenderer> | undefined;
  /** @internal */
  private readonly _platform: IPlatform;
  /** @internal */
  private readonly _compilationCache: WeakMap<PartialCustomElementDefinition, CustomElementDefinition> = new WeakMap();
  /** @internal */
  private readonly _fragmentCache: WeakMap<CustomElementDefinition, DocumentFragment | null> = new WeakMap();
  /** @internal */
  private readonly _empty: INodeSequence;
  /** @internal */
  private readonly _marker: Node;

  public get renderers(): Record<string, IRenderer> {
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
    this._marker = p.document.createElement('au-m');
    this._empty = new FragmentNodeSequence(p, p.document.createDocumentFragment());
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
      return new FragmentNodeSequence(this._platform, this._transformMarker(definition.template as Node) as DocumentFragment);
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
      this._transformMarker(fragment);

      cache.set(definition, fragment);
    }
    return fragment == null
      ? this._empty
      : new FragmentNodeSequence(
        this._platform,
        needsImportNode
          ? doc.importNode(fragment, true)
          : doc.adoptNode(fragment.cloneNode(true) as DocumentFragment)
        );
  }

  public render(
    controller: IHydratableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void {
    const rows = definition.instructions;
    const renderers = this.renderers;
    const ii = targets.length;

    let i = 0;
    let j = 0;
    let jj = rows.length;
    let row: readonly IInstruction[];
    let instruction: IInstruction;
    let target: INode;

    if (ii !== jj) {
      throw createMappedError(ErrorNames.rendering_mismatch_length, ii, jj);
    }

    if (ii > 0) {
      while (ii > i) {
        row = rows[i];
        target = targets[i];
        j = 0;
        jj = row.length;
        while (jj > j) {
          instruction = row[j];
          renderers[instruction.type].render(controller, target, instruction, this._platform, this._exprParser, this._observerLocator);
          ++j;
        }
        ++i;
      }
    }

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
  }

  /** @internal */
  private _transformMarker(fragment: Node | null) {
    if (fragment == null) {
      return null;
    }
    const walker = this._platform.document.createTreeWalker(fragment, /* NodeFilter.SHOW_COMMENT */ 128);
    let currentNode: Node | null;
    while ((currentNode = walker.nextNode()) != null) {
      if (currentNode.nodeValue === 'au*') {
        currentNode.parentNode!.replaceChild(walker.currentNode = this._marker.cloneNode(), currentNode);
      }
    }
    return fragment;
    // below is a homemade "comment query selector that seems to be as efficient as the TreeWalker
    // also it works with very minimal set of APIs (.nextSibling, .parentNode, .insertBefore, .removeChild)
    // while TreeWalker maynot be always available in platform that we may potentially support
    //
    // so leaving it here just in case we need it again, TreeWalker is slightly less code

    // let parent: Node = fragment;
    // let current: Node | null | undefined = parent.firstChild;
    // let next: Node | null | undefined = null;

    // while (current != null) {
    //   if (current.nodeType === 8 && current.nodeValue === 'au*') {
    //     next = current.nextSibling!;
    //     parent.removeChild(current);
    //     parent.insertBefore(this._marker(), next);
    //     if (next.nodeType === 8) {
    //       current = next.nextSibling;
    //       // todo: maybe validate?
    //     } else {
    //       current = next;
    //     }
    //   }

    //   next = current?.firstChild;
    //   if (next == null) {
    //     next = current?.nextSibling;
    //     if (next == null) {
    //       current = parent.nextSibling;
    //       parent = parent.parentNode!;
    //       // needs to keep walking up all the way til a valid next node
    //       while (current == null && parent != null) {
    //         current = parent.nextSibling;
    //         parent = parent.parentNode!;
    //       }
    //     } else {
    //       current = next;
    //     }
    //   } else {
    //     parent = current!;
    //     current = next;
    //   }
    // }
    // return fragment;
  }
}
