import { IContainer, resolve } from '@aurelia/kernel';
import { IExpressionParser, IObserverLocator } from '@aurelia/runtime';

import { FragmentNodeSequence, INode, INodeSequence } from '../dom';
import { IPlatform } from '../platform';
import { ICompliationInstruction, IInstruction, IRenderer, ITemplateCompiler } from '../renderer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
import { createLookup, isString } from '../utilities';
import { IViewFactory, ViewFactory } from './view';
import type { IHydratableController } from './controller';
import { createInterface } from '../utilities-di';
import { ErrorNames, createMappedError } from '../errors';

export const IRendering = /*@__PURE__*/createInterface<IRendering>('IRendering', x => x.singleton(Rendering));
export interface IRendering extends Rendering { }

export class Rendering {
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

  public get renderers(): Record<string, IRenderer> {
    return this._renderers ??= this._ctn.getAll(IRenderer, false).reduce((all, r) => {
      all[r.target] = r;
      return all;
    }, createLookup<IRenderer>());
  }

  public constructor() {
    const ctn = this._ctn = resolve(IContainer).root;
    this._platform = ctn.get(IPlatform);
    this._exprParser= ctn.get(IExpressionParser);
    this._observerLocator = ctn.get(IObserverLocator);
    this._empty = new FragmentNodeSequence(this._platform, this._platform.document.createDocumentFragment());
  }

  public compile(
    definition: PartialCustomElementDefinition,
    container: IContainer,
    compilationInstruction: ICompliationInstruction | null,
  ): CustomElementDefinition {
    if (definition.needsCompile !== false) {
      const compiledMap = this._compilationCache;
      const compiler = container.get(ITemplateCompiler);
      let compiled = compiledMap.get(definition);
      if (compiled == null) {
        // const fullDefinition = CustomElementDefinition.getOrCreate(definition);
        compiledMap.set(definition, compiled = compiler.compile(
          CustomElementDefinition.getOrCreate(definition),
          container,
          compilationInstruction
        ));
      } else {
        // todo:
        // should only register if the compiled def resolution is string
        // instead of direct resources
        container.register(...compiled.dependencies);
      }
      return compiled;
    }

    return definition as CustomElementDefinition;
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
      if (template === null) {
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
  private _marker() {
    return this._platform.document.createElement('au-m');
  }

  /** @internal */
  private _transformMarker(fragment: Node | null) {
    if (fragment == null) {
      return null;
    }
    let parent: Node = fragment;
    let current: Node | null | undefined = parent.firstChild;
    let next: Node | null | undefined = null;

    while (current != null) {
      if (current.nodeType === 8 && current.nodeValue === 'au*') {
        next = current.nextSibling!;
        parent.removeChild(current);
        parent.insertBefore(this._marker(), next);
        if (next.nodeType === 8) {
          current = next.nextSibling;
          // todo: maybe validate?
        } else {
          current = next;
        }
      }

      next = current?.firstChild;
      if (next == null) {
        next = current?.nextSibling;
        if (next == null) {
          current = parent.nextSibling;
          parent = parent.parentNode!;
          // needs to keep walking up all the way til a valid next node
          while (current == null && parent != null) {
            current = parent.nextSibling;
            parent = parent.parentNode!;
          }
        } else {
          current = next;
        }
      } else {
        parent = current!;
        current = next;
      }
    }
    return fragment;
  }
}
