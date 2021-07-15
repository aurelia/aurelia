import { DI, IContainer } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';

import { FragmentNodeSequence, INode, INodeSequence } from '../dom.js';
import { IPlatform } from '../platform.js';
import { ICompliationInstruction, IInstruction, IRenderer, ITemplateCompiler } from '../renderer.js';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element.js';
import { createLookup } from '../utilities-html.js';
import type { IHydratableController } from './controller.js';
import { IViewFactory, ViewFactory } from './view.js';

export const IRendering = DI.createInterface<IRendering>('IRendering', x => x.singleton(Rendering));
export interface IRendering extends Rendering { }

export class Rendering {
  public static inject: unknown[] = [IContainer];
  private readonly c: IContainer;
  private rs: Record<string, IRenderer> | undefined;
  private readonly p: IPlatform;
  private readonly compilationCache: WeakMap<PartialCustomElementDefinition, CustomElementDefinition> = new WeakMap();
  private readonly fragmentCache: WeakMap<CustomElementDefinition, DocumentFragment | null> = new WeakMap();
  private readonly empty: INodeSequence;

  public get renderers(): Record<string, IRenderer> {
    return this.rs == null
      ? (this.rs = this.c.getAll(IRenderer, false).reduce((all, r) => {
          all[r.instructionType!] = r;
          return all;
        }, createLookup<IRenderer>()))
      : this.rs;
  }

  public constructor(container: IContainer) {
    this.p = (this.c = container.root).get(IPlatform);
    this.empty = new FragmentNodeSequence(this.p, this.p.document.createDocumentFragment());
  }

  public compile(
    definition: PartialCustomElementDefinition,
    container: IContainer,
    compilationInstruction: ICompliationInstruction | null,
  ): CustomElementDefinition {
    if (definition.needsCompile !== false) {
      const compiledMap = this.compilationCache;
      const compiler = container.get(ITemplateCompiler);
      let compiled = compiledMap.get(definition);
      if (compiled == null) {
        compiledMap.set(definition, compiled = compiler.compile(definition, container, compilationInstruction));
      } else {
        // todo: should only registerr if the compiled def resolution is string instead of direct resources
        container.register(...compiled.dependencies);
      }
      return compiled;
    }

    return definition as CustomElementDefinition;
  }

  public getViewFactory(definition: PartialCustomElementDefinition, container: IContainer): IViewFactory {
    return new ViewFactory('', null!, container, CustomElementDefinition.getOrCreate(definition));
  }

  public createNodes(definition: CustomElementDefinition): INodeSequence {
    if (definition.enhance === true) {
      return new FragmentNodeSequence(this.p, definition.template as DocumentFragment);
    }
    let fragment: DocumentFragment | null | undefined;
    const cache = this.fragmentCache;
    if (cache.has(definition)) {
      fragment = cache.get(definition);
    } else {
      const p = this.p;
      const doc = p.document;
      const template = definition.template;
      let tpl: HTMLTemplateElement;
      if (template === null) {
        fragment = null;
      } else if (template instanceof p.Node) {
        if (template.nodeName === 'TEMPLATE') {
          fragment = doc.adoptNode((template as HTMLTemplateElement).content);
        } else {
          (fragment = doc.adoptNode(doc.createDocumentFragment())).appendChild(template.cloneNode(true));
        }
      } else {
        tpl = doc.createElement('template');
        if (typeof template === 'string') {
          tpl.innerHTML = template;
        }
        doc.adoptNode(fragment = tpl.content);
      }
      cache.set(definition, fragment);
    }
    return fragment == null
      ? this.empty
      : new FragmentNodeSequence(this.p, fragment.cloneNode(true) as DocumentFragment);
  }

  public render(
    flags: LifecycleFlags,
    controller: IHydratableController,
    targets: ArrayLike<INode>,
    definition: CustomElementDefinition,
    host: INode | null | undefined,
  ): void {
    const rows = definition.instructions;
    const renderers = this.renderers;
    const ii = targets.length;
    if (targets.length !== rows.length) {
      throw new Error(`The compiled template is not aligned with the render instructions. There are ${ii} targets and ${rows.length} instructions.`);
    }

    let i = 0;
    let j = 0;
    let jj = 0;
    let row: readonly IInstruction[];
    let instruction: IInstruction;
    let target: INode;

    while (ii > i) {
      row = rows[i];
      target = targets[i];
      j = 0;
      jj = row.length;
      while (jj > j) {
        instruction = row[j];
        renderers[instruction.type].render(flags, null!, controller, target, instruction);
        ++j;
      }
      ++i;
    }

    if (host !== void 0 && host !== null) {
      row = definition.surrogates;
      j = 0;
      jj = row.length;
      while (jj > j) {
        instruction = row[j];
        renderers[instruction.type].render(flags, null!, controller, host, instruction);
        ++j;
      }
    }
  }
}
