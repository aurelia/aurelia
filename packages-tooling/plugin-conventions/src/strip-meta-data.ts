import { kebabCase } from '@aurelia/kernel';
import { BindingMode, type PartialBindableDefinition } from '@aurelia/runtime-html';
import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';

type DefaultTreeElement = DefaultTreeAdapterMap['element'];
type ElementLocation = Token.ElementLocation;

interface IStrippedHtml {
  html: string;
  deps: string[];
  depsAliases: AliasedModule;
  /**
   * Dependencies imported with `<import from="..." defer>`, loaded when a deferred block that uses them renders.
   */
  deferredDeps: IDeferredDependency[];
  shadowMode: 'open' | 'closed' | null;
  containerless: boolean;
  hasSlot: boolean;
  bindables: Record<string, PartialBindableDefinition>;
  aliases: string[];
  capture: boolean;
}

type AliasedImports = Record<string, string | null> & {
  __MAIN__: string | null;
};

type AliasedModule = Record<string, AliasedImports>;

interface IDeferredDependency {
  from: string;
  /** The element name set with `as`, which otherwise comes from the file name. */
  as: string | null;
}

export function stripMetaData(rawHtml: string): IStrippedHtml {
  const deps: string[] = [];
  const deferredDeps: IDeferredDependency[] = [];
  // a map of string module name to its corresponding map of exports aliases
  const depsAliases: AliasedModule = { };
  let shadowMode: 'open' | 'closed' | null = null;
  let containerless: boolean = false;
  let hasSlot: boolean = false;
  let capture = false;
  const bindables: Record<string, PartialBindableDefinition> = {};
  const aliases: string[] = [];
  const toRemove: [number, number][] = [];
  const tree = parseFragment(rawHtml, { sourceCodeLocationInfo: true });

  traverse(tree, node => {
    stripImport(node, (dep, aliases, ranges, deferred) => {
      if (dep && deferred) {
        deferredDeps.push({ from: dep, as: aliases?.__MAIN__ ?? null });
      } else if (dep) {
        deps.push(dep);
        if (aliases != null) {
          // when a module is imported twicce
          // <import from="abc" as="...">
          // <import from="abc" x.as="y" z.as="zz">
          // or throw?
          depsAliases[dep] = { ...depsAliases[dep], ...aliases};
        }
      }
      toRemove.push(...ranges);
    });

    stripUseShadowDom(node, (mode, ranges) => {
      if (mode) shadowMode = mode;
      toRemove.push(...ranges);
    });

    stripContainerlesss(node, ranges => {
      containerless = true;
      toRemove.push(...ranges);
    });

    stripBindable(node, (bs, ranges) => {
      Object.assign(bindables, bs);
      toRemove.push(...ranges);
    });

    stripAlias(node, (aliasArray, ranges) => {
      aliases.push(...aliasArray);
      toRemove.push(...ranges);
    });

    stripCapture(node, (ranges) => {
      capture = true;
      toRemove.push(...ranges);
    });

    if (node.tagName === 'slot') {
      hasSlot = true;
    }
  });

  let html = '';
  let lastIdx = 0;
  toRemove.sort((a, b) => a[0] - b[0]).forEach(([start, end]) => {
    html += rawHtml.slice(lastIdx, start);
    lastIdx = end;
  });
  html += rawHtml.slice(lastIdx);

  return { html, deps, depsAliases, deferredDeps, shadowMode, containerless, hasSlot, bindables, aliases, capture };
}

function traverse(tree: DefaultTreeAdapterMap['documentFragment'] | DefaultTreeElement, cb: (node: DefaultTreeElement) => void) {
  tree.childNodes.forEach((n: DefaultTreeAdapterMap['childNode']) => {
    const ne = n as DefaultTreeElement;
    // skip <template as-custom-element="..">
    if (ne.tagName === 'template' && ne.attrs.some(attr => attr.name === 'as-custom-element')) {
      return;
    }
    cb(ne);
    if (ne.childNodes) traverse(ne, cb);
    // For <template> tag
    if ((n as DefaultTreeAdapterMap['template']).content?.childNodes) traverse((n as DefaultTreeAdapterMap['template']).content, cb);
  });
}

function stripTag(node: DefaultTreeElement, tagNames: string[] | string, cb: (attrs: Record<string, string>, ranges: [number, number][]) => void): boolean {
  if (!Array.isArray(tagNames)) tagNames = [tagNames];
  if (tagNames.includes(node.tagName)) {
    const attrs: Record<string, string> = {};
    node.attrs.forEach(attr => attrs[attr.name] = attr.value);
    const loc = node.sourceCodeLocation as ElementLocation;
    const toRemove: [number, number][] = [];
    if (loc.endTag) {
      toRemove.push([loc.endTag.startOffset, loc.endTag.endOffset]);
    }
    toRemove.push([loc.startTag!.startOffset, loc.startTag!.endOffset]);
    cb(attrs, toRemove);
    return true;
  }
  return false;
}

function stripAttribute(node: DefaultTreeElement, tagName: string, attributeName: string, cb: (value: string, range: [number, number][]) => void): boolean {
  if (node.tagName === tagName) {
    const attr = node.attrs.find(a => a.name === attributeName);
    if (attr) {
      const loc = node.sourceCodeLocation as ElementLocation;

      cb(attr.value, [[loc.attrs![attributeName].startOffset, loc.attrs![attributeName].endOffset]]);
      return true;
    }
  }
  return false;
}

// <import from="./foo">
// <require from="./foo">
// <import from="./foo"></import>
// <require from="./foo"></require>
// <require from="./foo" as="bar"></require>
// <require from="./foo" baz.as="bar"></require>
// <import from="./foo" defer>
// <import from="./foo" defer as="bar">
function stripImport(node: DefaultTreeElement, cb: (dep: string | undefined, aliases: AliasedImports | null, ranges: [number, number][], deferred: boolean) => void) {
  return stripTag(node, ['import', 'require'], (attrs, ranges) => {
    const aliases: AliasedImports = { __MAIN__: null };
    const deferred = 'defer' in attrs;
    let aliasCount = 0;
    Object.keys(attrs).forEach(attr => {
      if (attr === 'from' || attr === 'defer') {
        return;
      }
      if (deferred && attr !== 'as') {
        // A deferred import is keyed by a single element name, so it can't alias other exports
        throw new Error(`<${node.tagName} from="${attrs.from}" defer> only supports the "as" attribute, found "${attr}".`);
      }
      if (attr === 'as') {
        aliases.__MAIN__ = attrs[attr];
        aliasCount++;
      } else if (attr.endsWith('.as')) {
        aliases[attr.slice(0, -3)] = attrs[attr];
        aliasCount++;
      }
    });
    cb(attrs.from, aliasCount > 0 ? aliases : null, ranges, deferred);
  });
}

// <use-shadow-dom>
// <use-shadow-dom></use-shadow-dom>
// <use-shadow-dom mode="open">
// <use-shadow-dom mode="closed"></use-shadow-dom>
// <template use-shadow-dom>
// <template use-shadow-dom="open">
function stripUseShadowDom(node: DefaultTreeElement, cb: (mode: 'open' | 'closed', ranges: [number, number][]) => void) {
  let mode: 'open' | 'closed' = 'open';

  return stripTag(node, 'use-shadow-dom', (attrs, ranges) => {
    if (attrs.mode === 'closed') mode = 'closed';
    cb(mode, ranges);
  }) || stripAttribute(node, 'template', 'use-shadow-dom', (value, ranges) => {
    if (value === 'closed') mode = 'closed';
    cb(mode, ranges);
  });
}

// <containerless>
// <containerless></containerless>
// <template containerless>
function stripContainerlesss(node: DefaultTreeElement, cb: (ranges: [number, number][]) => void) {
  return stripTag(node, 'containerless', (attrs, ranges) => {
    cb(ranges);
  }) || stripAttribute(node, 'template', 'containerless', (value, ranges) => {
    cb(ranges);
  });
}

// <alias name="firstName">
// <alias name="firstName, lastName></alias>
// <template alias="firstName">
// <template alias="firstName,lastName">
function stripAlias(node: DefaultTreeElement, cb: (bindables: string[], ranges: [number, number][]) => void) {
  return stripTag(node, 'alias', (attrs, ranges) => {
    const { name } = attrs;
    let aliases: string[] = [];
    if (name) {
      aliases = name.split(',').map(s => s.trim()).filter(s => s);
    }
    cb(aliases, ranges);
  }) || stripAttribute(node, 'template', 'alias', (value, ranges) => {
    const aliases: string[] = value.split(',').map(s => s.trim()).filter(s => s);
    cb(aliases, ranges);
  });
}

// <bindable name="firstName">
// <bindable name="lastName" attribute="surname" mode="two-way"></bindable>
// <bindable name="lastName" attribute="surname" mode="TwoWay"></bindable>
// <template bindable="firstName">
// <template bindable="firstName,lastName">
// <template bindable="firstName,
//                     lastName">
function stripBindable(node: DefaultTreeElement, cb: (bindables: Record<string, PartialBindableDefinition>, ranges: [number, number][]) => void) {
  return stripTag(node, 'bindable', (attrs, ranges) => {
    const { name, mode, attribute } = attrs;
    const bindables: Record<string, PartialBindableDefinition> = {};
    if (name) {
      const description: PartialBindableDefinition = {};
      if (attribute) description.attribute = attribute;
      const bindingMode = toBindingMode(mode);
      if (bindingMode) description.mode = bindingMode;
      bindables[name] = description;
    }
    cb(bindables, ranges);
  }) || stripAttribute(node, 'template', 'bindable', (value, ranges) => {
    const bindables: Record<string, PartialBindableDefinition> = {};
    const names = value.split(',').map(s => s.trim()).filter(s => s);
    names.forEach(name => bindables[name] = {});
    cb(bindables, ranges);
  });
}

function stripCapture(node: DefaultTreeElement, cb: (ranges: [number, number][]) => void) {
  return stripTag(node, 'capture', (attrs, ranges) => {
    cb(ranges);
  }) || stripAttribute(node, 'template', 'capture', (value, ranges) => {
    cb(ranges);
  });
}

function toBindingMode(mode?: string): BindingMode | undefined {
  if (mode) {
    const normalizedMode = kebabCase(mode);
    if (normalizedMode === 'one-time') return BindingMode.oneTime;
    if (normalizedMode === 'one-way' || normalizedMode === 'to-view') return BindingMode.toView;
    if (normalizedMode === 'from-view') return BindingMode.fromView;
    if (normalizedMode === 'two-way') return BindingMode.twoWay;
  }
}
