import { resolve } from '@aurelia/kernel';
import { IPlatform } from './platform';
import { createInterface } from './utilities-di';
import { objectFreeze, objectKeys, safeString } from './utilities';

export type HeadAttributeValue = string | number | boolean | null | undefined;

/**
 * A `<meta>`, `<link>` or `<base>` tag. Every property other than `key` becomes an attribute.
 * `null`, `undefined` and `false` omit the attribute, `true` renders it without a value.
 */
export interface HeadTagInput {
  readonly [attribute: string]: HeadAttributeValue;
  /**
   * Replaces the key derived from the tag's attributes.
   * Tags with the same key replace each other instead of being rendered twice.
   */
  readonly key?: string;
}

/**
 * A `<script>` tag, typically JSON-LD structured data.
 * Every property other than `key`, `json` and `text` becomes an attribute.
 */
export interface HeadScriptInput {
  readonly [attribute: string]: unknown;
  readonly key?: string;
  /**
   * Serialized with `JSON.stringify` and escaped so the value can't close the `<script>` element.
   * Takes precedence over `text`.
   */
  readonly json?: unknown;
  /** Raw script content. Never put untrusted input here, it is not escaped. */
  readonly text?: string;
}

export interface HeadInput {
  readonly title?: string | null;
  readonly base?: HeadTagInput | null;
  readonly meta?: readonly HeadTagInput[] | null;
  readonly link?: readonly HeadTagInput[] | null;
  readonly script?: readonly HeadScriptInput[] | null;
  /** Attributes for the `<html>` element, such as `lang` and `dir`. */
  readonly htmlAttrs?: Readonly<Record<string, HeadAttributeValue>> | null;
}

/**
 * A group of head tags owned by one caller. Obtain one with `IHead.create()`.
 */
export interface IHeadSource {
  /**
   * Replace every tag this source contributes. Passing `null` removes them.
   */
  set(input: HeadInput | null | undefined): void;
  /**
   * Remove every tag this source contributes, restoring whatever each tag replaced.
   * A disposed source can be `set()` again, it then counts as the most recently activated.
   */
  dispose(): void;
}

export interface IHeadSourceOptions {
  /**
   * Sources with a higher priority win a key regardless of activation order.
   * Defaults to `HeadPriority.component`.
   */
  readonly priority?: number;
}

/**
 * The priorities used by the framework. Within one priority, the most recently activated source wins.
 */
export const HeadPriority = /*@__PURE__*/objectFreeze({
  /** `HeadConfiguration` defaults. */
  defaults: -200,
  /** Route-level `title` and `head`, set by the router. */
  route: -100,
  /** `<au-head>` and sources created from code. */
  component: 0,
} as const);

export interface IHeadCanonicalOptions {
  /** The origin written in front of the router path, for example `https://shop.example`. */
  readonly origin: string;
  /** Query parameters kept in the canonical URL. Every other parameter is dropped. */
  readonly keepQuery?: readonly string[];
}

export interface IHeadOptions {
  /** Formats every title before it is written to the document. */
  readonly titleTemplate?: ((title: string) => string) | null;
  /** Tags applied for the lifetime of the app, below every other source. */
  readonly defaults?: HeadInput | null;
  /** Makes the router write `<link rel="canonical">` on every navigation. */
  readonly canonical?: IHeadCanonicalOptions | null;
}

export const IHeadOptions = /*@__PURE__*/createInterface<IHeadOptions>('IHeadOptions', x => x.instance({}));

export interface IHead {
  /**
   * Create a source of head tags. Sources are resolved per key:
   * the highest priority wins, then the most recently activated.
   */
  create(options?: IHeadSourceOptions): IHeadSource;
  /**
   * The managed `<title>` and tags as an HTML string, for server rendering setups that write the `<head>` themselves.
   */
  serialize(): string;
  /**
   * Server-rendered tags that no client source has claimed are removed once the app has activated
   * and every promise passed here has settled. Use it for async startup work that sets head tags,
   * the router uses it for its first navigation. Calls made after that point have no effect.
   */
  waitFor(work: unknown): void;
}

/**
 * Manages `<title>`, `<meta>`, `<link>`, `<script>`, `<base>` and `<html>` attributes.
 *
 * There is intentionally no default registration: register `HeadConfiguration` to use it,
 * which also lets packages such as the router detect it with `optional(IHead)`.
 */
export const IHead = /*@__PURE__*/createInterface<IHead>('IHead');

/** @internal */ export const managedAttr = 'data-au-head';

const kTitle = 0;
const kElement = 1;
const kAttr = 2;
type EntryKind = typeof kTitle | typeof kElement | typeof kAttr;

interface HeadEntry {
  readonly kind: EntryKind;
  readonly source: HeadSource;
  /** The title text or the attribute value. */
  readonly value: string | null;
  readonly el: Element | null;
}

interface HeadSlot {
  readonly kind: EntryKind;
  /** Sorted by priority, then activation. The last entry wins. */
  readonly entries: HeadEntry[];
  /** The element currently in the document for this key. */
  node: Element | null;
  /** An element that was in the document before any source claimed the key. */
  original: Element | null;
  /** The `<html>` attribute value before any source claimed it. */
  originalValue: string | null;
  /** Rendered by the server, not yet claimed by a client source. */
  pending: boolean;
}

const emptyEntries: ReadonlyMap<string, HeadEntry> = /*@__PURE__*/new Map();

export class HeadSource implements IHeadSource {
  /** @internal */ public _entries: ReadonlyMap<string, HeadEntry> = emptyEntries;
  /** @internal */ public _seq: number = 0;

  public constructor(
    /** @internal */ private readonly _head: Head,
    /** @internal */ public readonly _priority: number,
  ) {}

  public set(input: HeadInput | null | undefined): void {
    this._head._commit(this, input == null ? emptyEntries : this._head._createEntries(this, input));
  }

  public dispose(): void {
    this._head._commit(this, emptyEntries);
  }

  /**
   * Make an element created elsewhere (by `<au-head>`) this source's only tag.
   * The element is moved into the document as is, so bindings on it keep working.
   *
   * @internal
   */
  public _setElement(el: Element, explicitKey: string | null): void {
    el.setAttribute(managedAttr, explicitKey ?? '');
    const key = this._head._keyOf(el.localName, explicitKey, name => el.getAttribute(name));
    this._head._commit(this, new Map([[key, { kind: kElement, source: this, value: null, el }]]));
  }
}

export class Head implements IHead {
  /** @internal */ private readonly _doc: Document = resolve(IPlatform).document;
  /** @internal */ private readonly _options: IHeadOptions = resolve(IHeadOptions);
  /** @internal */ private readonly _slots: Map<string, HeadSlot> = new Map();
  /** @internal */ private _seq: number = 0;
  /** @internal */ private _uid: number = 0;
  /** @internal */ private _title: Element | null = null;
  /** @internal */ private _originalTitle: string | null = null;
  /** @internal */ private _defaults: HeadSource | null = null;
  // One for the app activation, plus one per waitFor() still in flight.
  /** @internal */ private _pendingWork: number = 1;
  /** @internal */ private _appActivated: boolean = false;

  public constructor() {
    // A server-rendered document already contains the tags the server resolved. Track them by key so
    // client sources take them over in place, and drop the ones nothing claims once the app has started.
    const els = this._doc.head?.querySelectorAll(`[${managedAttr}]`) ?? [];
    for (let i = 0, ii = els.length; ii > i; ++i) {
      const el = els[i];
      if (el.localName === 'title') {
        continue;
      }
      const explicitKey = el.getAttribute(managedAttr);
      const key = this._keyOf(el.localName, explicitKey === '' ? null : explicitKey, name => el.getAttribute(name));
      this._slots.set(key, { kind: kElement, entries: [], node: el, original: null, originalValue: null, pending: true });
    }
  }

  public create(options?: IHeadSourceOptions): IHeadSource {
    return new HeadSource(this, options?.priority ?? HeadPriority.component);
  }

  public serialize(): string {
    let html = this._title === null ? '' : this._title.outerHTML;
    for (const slot of this._slots.values()) {
      if (slot.kind === kElement && slot.node !== null && slot.node !== slot.original) {
        html += slot.node.outerHTML;
      }
    }
    return html;
  }

  public waitFor(work: unknown): void {
    if (this._pendingWork > 0) {
      ++this._pendingWork;
      void Promise.resolve(work).then(this._release, this._release);
    }
  }

  /** @internal */
  public _start(): void {
    (this._defaults ??= new HeadSource(this, HeadPriority.defaults)).set(this._options.defaults);
  }

  /** @internal */
  public _activated(): void {
    if (!this._appActivated) {
      this._appActivated = true;
      // Deferred so waitFor() calls from app tasks later in the same activated slot, such as the
      // router's first navigation, are counted before the check.
      void Promise.resolve().then(this._release);
    }
  }

  /** @internal */
  public _stop(): void {
    this._defaults?.dispose();
  }

  /** @internal */
  private readonly _release = (): void => {
    if (--this._pendingWork === 0) {
      // Remove server-rendered tags that no client source claimed.
      for (const [key, slot] of this._slots) {
        if (slot.pending) {
          slot.pending = false;
          if (slot.entries.length === 0) {
            slot.node!.remove();
            this._slots.delete(key);
          }
        }
      }
    }
  };

  /** @internal */
  public _keyOf(tag: string, explicitKey: string | null, getAttr: (name: string) => string | null): string {
    if (explicitKey !== null) {
      return `${tag}:key:${explicitKey}`;
    }
    switch (tag) {
      case 'base':
        return 'base';
      case 'meta': {
        if (getAttr('charset') !== null) {
          return 'meta:charset';
        }
        for (const name of metaKeyAttrs) {
          let value = getAttr(name);
          if (value !== null) {
            if (name === 'http-equiv') {
              value = value.toLowerCase();
            }
            // theme-color and similar tags legitimately repeat with different media queries
            const media = getAttr('media');
            return `meta:${name}:${value}${media === null ? '' : `:${media}`}`;
          }
        }
        break;
      }
      case 'link': {
        const rel = (getAttr('rel') ?? '').trim().toLowerCase();
        if (rel === 'canonical') {
          return 'link:canonical';
        }
        const hreflang = getAttr('hreflang');
        if (rel === 'alternate' && hreflang !== null) {
          return `link:alternate:${hreflang.toLowerCase()}`;
        }
        return `link:${rel}:${getAttr('href') ?? ''}`;
      }
      case 'script': {
        const src = getAttr('src');
        if (src !== null) {
          return `script:src:${src}`;
        }
        break;
      }
    }
    // A tag without an identity never replaces another one.
    return `#${++this._uid}`;
  }

  /** @internal */
  public _createEntries(source: HeadSource, input: HeadInput): Map<string, HeadEntry> {
    const entries = new Map<string, HeadEntry>();
    if (input.title != null) {
      entries.set('title', { kind: kTitle, source, value: safeString(input.title), el: null });
    }
    if (input.base != null) {
      this._addTag(entries, source, 'base', input.base);
    }
    this._addTags(entries, source, 'meta', input.meta);
    this._addTags(entries, source, 'link', input.link);
    this._addTags(entries, source, 'script', input.script);
    const htmlAttrs = input.htmlAttrs;
    if (htmlAttrs != null) {
      for (const name of objectKeys(htmlAttrs)) {
        const value = toAttr(htmlAttrs[name]);
        if (value !== null) {
          entries.set(`html:${name}`, { kind: kAttr, source, value, el: null });
        }
      }
    }
    return entries;
  }

  /** @internal */
  private _addTags(
    entries: Map<string, HeadEntry>,
    source: HeadSource,
    tag: string,
    inputs: readonly (HeadTagInput | HeadScriptInput)[] | null | undefined,
  ): void {
    if (inputs != null) {
      for (const input of inputs) {
        this._addTag(entries, source, tag, input);
      }
    }
  }

  /** @internal */
  private _addTag(
    entries: Map<string, HeadEntry>,
    source: HeadSource,
    tag: string,
    input: HeadTagInput | HeadScriptInput,
  ): void {
    const explicitKey = input.key ?? null;
    const key = this._keyOf(tag, explicitKey, name => toAttr(input[name]));
    // Reuse the element from the previous set() so updating a value patches it instead of replacing it.
    let el = source._entries.get(key)?.el ?? null;
    if (el === null) {
      // Patch an unclaimed server-rendered copy too, so a <script src> doesn't run again and a <link> isn't refetched.
      const slot = this._slots.get(key);
      if (slot?.pending === true && slot.entries.length === 0) {
        el = slot.node;
      }
    }
    if (el === null || el.localName !== tag) {
      el = this._doc.createElement(tag);
    }
    el.setAttribute(managedAttr, explicitKey ?? '');

    const isScript = tag === 'script';
    const attrs = el.attributes;
    for (let i = attrs.length - 1; i >= 0; --i) {
      const name = attrs[i].name;
      if (name !== managedAttr && toAttr(input[name]) === null) {
        el.removeAttribute(name);
      }
    }
    for (const name of objectKeys(input)) {
      if (name === 'key' || isScript && (name === 'json' || name === 'text')) {
        continue;
      }
      const value = toAttr(input[name]);
      if (value !== null && el.getAttribute(name) !== value) {
        el.setAttribute(name, value);
      }
    }
    if (isScript) {
      const { json, text } = input as HeadScriptInput;
      const content = json !== void 0 ? serializeJson(json) : text ?? '';
      if (el.textContent !== content) {
        el.textContent = content;
      }
    }
    // Later tags with the same key win within a source too.
    entries.delete(key);
    entries.set(key, { kind: kElement, source, value: null, el });
  }

  /** @internal */
  public _commit(source: HeadSource, next: ReadonlyMap<string, HeadEntry>): void {
    const prev = source._entries;
    if (prev.size === 0 && next.size > 0) {
      source._seq = ++this._seq;
    }
    source._entries = next;

    for (const [key, entry] of prev) {
      if (!next.has(key)) {
        const slot = this._slots.get(key)!;
        slot.entries.splice(slot.entries.indexOf(entry), 1);
        this._apply(key, slot);
      }
    }
    for (const [key, entry] of next) {
      const slot = this._getSlot(key, entry.kind);
      const entries = slot.entries;
      const old = prev.get(key);
      if (old !== void 0) {
        entries[entries.indexOf(old)] = entry;
      } else {
        let i = entries.length;
        while (i > 0 && compareEntries(entries[i - 1], entry) > 0) {
          --i;
        }
        entries.splice(i, 0, entry);
      }
      this._apply(key, slot);
    }
  }

  /** @internal */
  private _getSlot(key: string, kind: EntryKind): HeadSlot {
    let slot = this._slots.get(key);
    if (slot === void 0) {
      slot = { kind, entries: [], node: null, original: null, originalValue: null, pending: false };
      if (kind === kElement) {
        slot.node = slot.original = this._findOriginal(key);
      } else if (kind === kAttr) {
        slot.originalValue = this._doc.documentElement.getAttribute(key.slice(5));
      }
      this._slots.set(key, slot);
    }
    return slot;
  }

  /**
   * Find a tag from the page itself (usually index.html) that a source is about to replace.
   *
   * @internal
   */
  private _findOriginal(key: string): Element | null {
    const children = this._doc.head?.children;
    if (children == null || key.charCodeAt(0) === /* # */35) {
      return null;
    }
    for (let i = 0, ii = children.length; ii > i; ++i) {
      const el = children[i];
      if (!el.hasAttribute(managedAttr) && this._keyOf(el.localName, null, name => el.getAttribute(name)) === key) {
        return el;
      }
    }
    return null;
  }

  /** @internal */
  private _apply(key: string, slot: HeadSlot): void {
    const entries = slot.entries;
    const winner = entries.length > 0 ? entries[entries.length - 1] : null;
    switch (slot.kind) {
      case kTitle:
        this._applyTitle(winner);
        break;
      case kAttr: {
        const name = key.slice(5);
        const value = winner === null ? slot.originalValue : winner.value;
        const html = this._doc.documentElement;
        if (value === null) {
          html.removeAttribute(name);
        } else if (html.getAttribute(name) !== value) {
          html.setAttribute(name, value);
        }
        break;
      }
      default: {
        const next = winner?.el ?? slot.original;
        const prev = slot.node;
        if (next !== prev) {
          if (prev?.parentNode != null) {
            if (next === null) {
              prev.remove();
            } else {
              prev.replaceWith(next);
            }
          } else if (next !== null) {
            const head = this._doc.head;
            if (head !== null) {
              // <meta charset> has to be within the first 1024 bytes and <base> has to precede every URL it affects
              let ref: Node | null = null;
              if (key === 'meta:charset') {
                ref = head.firstChild;
              } else if (key === 'base') {
                ref = head.querySelector('meta[charset]')?.nextSibling ?? head.firstChild;
              }
              head.insertBefore(next, ref);
            }
          }
          slot.node = next;
        }
        if (winner !== null) {
          slot.pending = false;
        }
      }
    }
    if (entries.length === 0 && !slot.pending) {
      this._slots.delete(key);
    }
  }

  /** @internal */
  private _applyTitle(winner: HeadEntry | null): void {
    let el = this._title;
    if (winner === null) {
      if (el !== null) {
        if (this._originalTitle === null) {
          el.remove();
        } else {
          el.textContent = this._originalTitle;
        }
        this._title = null;
      }
      return;
    }

    if (el === null) {
      const doc = this._doc;
      // scoped to the head, an <svg><title> in the body is not the document title
      el = doc.head?.querySelector('title') ?? null;
      if (el === null) {
        el = doc.createElement('title');
        el.setAttribute(managedAttr, '');
        doc.head?.appendChild(el);
      }
      this._title = el;
      this._originalTitle = el.hasAttribute(managedAttr) ? null : el.textContent;
    }
    const titleTemplate = this._options.titleTemplate;
    const text = titleTemplate == null ? winner.value! : titleTemplate(winner.value!);
    if (el.textContent !== text) {
      el.textContent = text;
    }
  }
}

const metaKeyAttrs = ['name', 'property', 'http-equiv', 'itemprop'] as const;

const compareEntries = (a: HeadEntry, b: HeadEntry): number =>
  (a.source._priority - b.source._priority) || (a.source._seq - b.source._seq);

const toAttr = (value: unknown): string | null =>
  value == null || value === false ? null : value === true ? '' : safeString(value);

const escapeJsonChar = (c: string): string => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`;

/**
 * JSON that is safe inside a `<script>` element: `<`, `>` and `&` are escaped so a value can never
 * produce `</script>` or `<!--`, and U+2028/U+2029 are escaped for older JavaScript parsers.
 *
 * @internal
 */
export const serializeJson = (value: unknown): string =>
  (JSON.stringify(value) ?? '').replace(/[<>&\u2028\u2029]/g, escapeJsonChar);
