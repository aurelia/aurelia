import { parseFragment, DefaultTreeElement, ElementLocation } from 'parse5';

interface IStrippedHtml {
  html: string,
  deps: string[]
}

export function stripHtmlImport(rawHtml: string): IStrippedHtml {
  const deps: string[] = [];
  const toRemove: [number, number][] = [];
  const tree = parseFragment(rawHtml, { sourceCodeLocationInfo: true });

  traverse(tree, node => {
    if (node.tagName !== 'import' && node.tagName !== 'require') {
      return;
    }

    const attr = node.attrs.find(a => a.name === 'from')
    if (attr && attr.value) deps.push(attr.value);

    const loc = node.sourceCodeLocation as ElementLocation;
    if (loc.endTag) {
      toRemove.push([loc.endTag.startOffset, loc.endTag.endOffset]);
    }
    if (loc.startTag) {
      toRemove.push([loc.startTag.startOffset, loc.startTag.endOffset]);
    }
  });

  let html = '';
  let lastIdx = 0;
  toRemove.sort((a, b) => a[0] - b[0]).forEach(([start, end]) => {
    html += rawHtml.slice(lastIdx, start);
    lastIdx = end;
  });
  html += rawHtml.slice(lastIdx);

  return { html, deps };
}

function traverse(tree: any, cb: (node: DefaultTreeElement) => void) {
  tree.childNodes.forEach((n: any) => {
    cb(n as DefaultTreeElement);
    if (n.childNodes) traverse(n, cb);
    // For <template> tag
    if (n.content && n.content.childNodes) traverse(n.content, cb);
  });
}
