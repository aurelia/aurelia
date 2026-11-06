import { onResolve, resolve } from '@aurelia/kernel';
import type { ITemplateCompilerHooks } from '@aurelia/template-compiler';
import { CustomAttributeStaticAuDefinition, attrTypeName } from '../custom-attribute';
import { IViewFactory } from '../../templating/view';
import { IHead, serializeJson, type HeadSource, type IHeadSource } from '../../head';
import { ErrorNames, createMappedError } from '../../errors';
import { isElement } from '../../utilities-dom';
import { safeString } from '../../utilities';
import type { ControllerVisitor, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, ISyntheticView } from '../../templating/controller';

const tagAttr = 'au-head-tag';

/**
 * Compiles `<au-head>` away. Its `<title>`, `<meta>`, `<link>`, `<script>` and `<base>` children stay where
 * `<au-head>` was, each wrapped in the `au-head-tag` template controller, which hands the bound element
 * to `IHead` so it renders into the document head with its bindings live:
 *
 * ```html
 * <au-head>
 *   <title>${product.name}</title>
 *   <meta name="description" content.bind="product.summary">
 * </au-head>
 * ```
 *
 * A custom element would leave a containerless controller in the tree, and those can't be hydrated
 * from server-rendered markup. With the wrapper gone, only template controllers remain, which hydrate
 * like any other.
 */
export class AuHeadTemplateCompilerHooks implements ITemplateCompilerHooks {
  public compiling(template: HTMLElement): void {
    unwrapHeads(template.nodeName === 'TEMPLATE' ? (template as HTMLTemplateElement).content : template);
  }
}

function unwrapHeads(root: ParentNode): void {
  // querySelectorAll does not look inside <template> content, so nested templates are walked separately
  const els = root.querySelectorAll('au-head,template');
  for (let i = 0, ii = els.length; ii > i; ++i) {
    const el = els[i];
    if (el.localName === 'template') {
      unwrapHeads((el as HTMLTemplateElement).content);
    } else {
      prepareChildren(el);
      let node = el.firstChild;
      while (node !== null) {
        const next = node.nextSibling;
        if (isElement(node)) {
          el.parentNode!.insertBefore(node, el);
        } else if (node.nodeType === /* text */3 && node.textContent!.trim() !== '') {
          throw createMappedError(ErrorNames.au_head_invalid_child, '#text');
        }
        node = next;
      }
      el.remove();
    }
  }
}

function prepareChildren(parent: ParentNode): void {
  let node = parent.firstChild;
  while (node !== null) {
    if (isElement(node)) {
      prepareTag(node);
    }
    node = node.nextSibling;
  }
}

function prepareTag(el: Element): void {
  const tag = el.localName;
  switch (tag) {
    case 'template':
      // <template if.bind> / <template repeat.for> grouping several tags
      prepareChildren((el as HTMLTemplateElement).content);
      return;
    case 'let':
      return;
  }
  const attrs = el.attributes;
  for (let i = 0, ii = attrs.length; ii > i; ++i) {
    if (attrs[i].name.includes(tagAttr)) {
      // already prepared
      return;
    }
  }
  switch (tag) {
    case 'title':
      // <title> content is raw text: interpolation markers inside it would not survive
      // serialization (AOT, SSR), so the text becomes the value of the tag controller instead.
      el.setAttribute(tagAttr, el.textContent ?? '');
      el.textContent = '';
      return;
    case 'script': {
      if (el.textContent?.includes('${')) {
        throw createMappedError(ErrorNames.au_head_script_interpolation);
      }
      for (let i = attrs.length - 1; i >= 0; --i) {
        const { name, value } = attrs[i];
        if (name.startsWith('json.') || name === ':json') {
          el.removeAttribute(name);
          el.setAttribute(name.replace('json', tagAttr), value);
          return;
        }
      }
      break;
    }
    case 'meta':
    case 'link':
    case 'base':
      break;
    default:
      throw createMappedError(ErrorNames.au_head_invalid_child, tag);
  }
  // Appended last so it is the innermost template controller, wrapping only the tag itself.
  el.setAttribute(tagAttr, '');
}

/**
 * The template controller `<au-head>` leaves on each of its tags.
 *
 * Its view is activated but never mounted: the tag element is bound in place and handed to `IHead`,
 * which moves it into the document head. Moving the element out of a mounted view would break the
 * view's node bookkeeping, which is why the view is kept detached instead.
 *
 * The value is the text of a `<title>`, or the `json.bind` value of a `<script>`.
 */
export class AuHeadTag implements ICustomAttributeViewModel {
  // A getter instead of a static field: a field compiles to an assignment after the class, which bundlers
  // have to keep, and apps that never register HeadConfiguration would ship this controller anyway.
  public static get $au(): CustomAttributeStaticAuDefinition<'value'> {
    return auHeadTagDefinition;
  }

  public readonly $controller!: ICustomAttributeController<this>;

  public value: unknown = '';

  /** @internal */ private readonly _view: ISyntheticView;
  /** @internal */ private readonly _el: Element;
  /** @internal */ private readonly _key: string | null;
  /** @internal */ private readonly _head: IHead = resolve(IHead);
  /** @internal */ private _source: IHeadSource | null = null;
  /** @internal */ private _active: boolean = false;

  public constructor() {
    const view = this._view = resolve(IViewFactory).create();
    const nodes = view.nodes.childNodes;
    let el: Element | null = null;
    for (let i = 0, ii = nodes.length; el === null && ii > i; ++i) {
      if (isElement(nodes[i])) {
        el = nodes[i] as Element;
      }
    }
    this._el = el!;
    this._key = el!.getAttribute('key');
    if (this._key !== null) {
      el!.removeAttribute('key');
    }
  }

  public attaching(initiator: IHydratedController): void | Promise<void> {
    const $controller = this.$controller;
    return onResolve(this._view.activate(initiator, $controller, $controller.scope), () => {
      this._active = true;
      this._update();
    });
  }

  public detaching(initiator: IHydratedController): void | Promise<void> {
    this._active = false;
    this._source?.dispose();
    return this._view.deactivate(initiator, this.$controller);
  }

  public valueChanged(): void {
    if (this._active) {
      this._update();
    }
  }

  /** @internal */
  private _update(): void {
    const el = this._el;
    const value = this.value;
    const source = this._source ??= this._head.create();
    switch (el.localName) {
      case 'title':
        source.set({ title: value == null ? '' : safeString(value) });
        return;
      case 'script':
        // '' is the value of a plain script, anything else came from json.bind
        if (value !== '') {
          if (value == null) {
            source.dispose();
            return;
          }
          const json = serializeJson(value);
          if (el.textContent !== json) {
            el.textContent = json;
          }
        }
        break;
    }
    (source as HeadSource)._setElement(el, this._key);
  }

  public dispose(): void {
    this._view.dispose();
  }

  public accept(visitor: ControllerVisitor): void | true {
    if (this._view.accept(visitor) === true) {
      return true;
    }
  }
}

const auHeadTagDefinition: CustomAttributeStaticAuDefinition<'value'> = {
  type: attrTypeName,
  name: tagAttr,
  isTemplateController: true,
  noMultiBindings: true,
  bindables: ['value'],
};
