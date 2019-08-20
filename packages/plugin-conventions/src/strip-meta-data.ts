import { parseFragment, DefaultTreeElement, ElementLocation } from 'parse5';

interface IStrippedHtml {
  html: string,
  shadowMode: 'open' | 'closed' | null,
  deps: string[]
}

export function stripMetaData(rawHtml: string): IStrippedHtml {
  const deps: string[] = [];
  let shadowMode: 'open' | 'closed' | null = null;
  const toRemove: [number, number][] = [];
  const tree = parseFragment(rawHtml, { sourceCodeLocationInfo: true });

  traverse(tree, node => {
    stripImport(node, (value, ranges) => {
      if (value) deps.push(value);
      toRemove.push(...ranges);
    });
    stripUseShadowDom(node, (mode, ranges) => {
      if (mode) shadowMode = mode;
      toRemove.push(...ranges);
    })
  });

  let html = '';
  let lastIdx = 0;
  toRemove.sort((a, b) => a[0] - b[0]).forEach(([start, end]) => {
    html += rawHtml.slice(lastIdx, start);
    lastIdx = end;
  });
  html += rawHtml.slice(lastIdx);

  return { html, shadowMode, deps };
}

function traverse(tree: any, cb: (node: DefaultTreeElement) => void) {
  tree.childNodes.forEach((n: any) => {
    cb(n as DefaultTreeElement);
    if (n.childNodes) traverse(n, cb);
    // For <template> tag
    if (n.content && n.content.childNodes) traverse(n.content, cb);
  });
}

function stripImport(node: DefaultTreeElement, cb: (value: string | undefined, ranges: [number, number][]) => void) {
  if (node.tagName === 'import' || node.tagName === 'require') {
    const attr = node.attrs.find(a => a.name === 'from')
    const value = attr && attr.value;
    const toRemove: [number, number][] = [];

    const loc = node.sourceCodeLocation as ElementLocation;
    if (loc.endTag) {
      toRemove.push([loc.endTag.startOffset, loc.endTag.endOffset]);
    }
    toRemove.push([loc.startTag.startOffset, loc.startTag.endOffset]);

    cb(value, toRemove);
  }
}

function stripUseShadowDom(node: DefaultTreeElement, cb: (mode: 'open' | 'closed', ranges: [number, number][]) => void) {
  let mode: 'open' | 'closed' = 'open';
  const toRemove: [number, number][] = [];
  const loc = node.sourceCodeLocation as ElementLocation;

  if (node.tagName === 'use-shadow-dom') {
    const attr = node.attrs.find(a => a.name === 'mode');
    if (attr && attr.value === 'closed') mode = 'closed';
    if (loc.endTag) {
      toRemove.push([loc.endTag.startOffset, loc.endTag.endOffset]);
    }
    toRemove.push([loc.startTag.startOffset, loc.startTag.endOffset]);
    cb(mode, toRemove);
  } else if (node.tagName === 'template') {
    const attr = node.attrs.find(a => a.name === 'use-shadow-dom');
    if (attr) {
      if (attr.value === 'closed') mode = 'closed';
      toRemove.push([loc.attrs['use-shadow-dom'].startOffset, loc.attrs['use-shadow-dom'].endOffset]);
      cb(mode, toRemove);
    }
  }
}
