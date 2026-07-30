import { statSync } from 'fs';
import type { IHtmlTemplateTransformResult } from '@aurelia/plugin-conventions';
import { dirname, resolve } from 'path';
import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';

type DefaultTreeNode = DefaultTreeAdapterMap['node'];
type DefaultTreeElement = DefaultTreeAdapterMap['element'];
type DefaultTreeTemplate = DefaultTreeAdapterMap['template'];
type AttributeLocation = Token.Location;

const htmlAssetAttributes: Record<string, { src?: readonly string[]; srcset?: readonly string[] }> = {
  img: { src: ['src'], srcset: ['srcset'] },
  image: { src: ['href', 'xlink:href'] },
  source: { src: ['src'], srcset: ['srcset'] },
  use: { src: ['href', 'xlink:href'] },
  video: { src: ['src', 'poster'] },
};

interface Replacement {
  start: number;
  end: number;
  value: string;
}

interface AssetToken {
  token: string;
  variable: string;
  specifier: string;
}

export function transformTemplateAssetUrls(html: string, htmlId: string): IHtmlTemplateTransformResult | undefined {
  const replacements: Replacement[] = [];
  const assets: AssetToken[] = [];
  const tree = parseFragment(html, { sourceCodeLocationInfo: true });

  visitElements(tree.childNodes, (node) => {
    const assetAttrs = htmlAssetAttributes[node.nodeName];
    const attrs = getAttributes(node);
    if (assetAttrs == null || attrs.has('vite-ignore')) return;

    assetAttrs.src?.forEach((name) => {
      const value = attrs.get(name);
      const loc = node.sourceCodeLocation?.attrs?.[name];
      if (value == null || loc == null) return;

      const token = createAssetToken(value, htmlId, assets);
      if (token == null) return;
      const valueLocation = getAttributeValueLocation(html, loc);
      if (valueLocation == null) return;
      replacements.push({ ...valueLocation, value: token.token });
    });

    assetAttrs.srcset?.forEach((name) => {
      const value = attrs.get(name);
      const loc = node.sourceCodeLocation?.attrs?.[name];
      if (value == null || loc == null) return;
      replaceSrcset(value, loc, html, htmlId, replacements, assets);
    });
  });

  if (assets.length === 0) return void 0;

  const transformedHtml = applyReplacements(html, replacements);
  const imports = assets.map(asset => `import ${asset.variable} from ${JSON.stringify(asset.specifier)};\n`);
  return {
    imports,
    template: createTemplateExpression(transformedHtml, assets),
  };
}

function visitElements(nodes: DefaultTreeNode[], callback: (node: DefaultTreeElement) => void): void {
  for (const node of nodes) {
    if (!('attrs' in node)) continue;

    const element = node as DefaultTreeElement;
    callback(element);

    visitElements(element.childNodes, callback);
    if (element.tagName === 'template') {
      visitElements((element as DefaultTreeTemplate).content.childNodes, callback);
    }
  }
}

function getAttributes(node: DefaultTreeElement): Map<string, string> {
  const attrs = new Map<string, string>();
  for (const attr of node.attrs) {
    attrs.set(attr.prefix == null ? attr.name : `${attr.prefix}:${attr.name}`, attr.value);
  }
  return attrs;
}

function replaceSrcset(
  value: string,
  attrLocation: AttributeLocation,
  html: string,
  htmlId: string,
  replacements: Replacement[],
  assets: AssetToken[],
): void {
  const valueLocation = getAttributeValueLocation(html, attrLocation);
  if (valueLocation == null) return;

  let changed = false;
  const srcset = value.replace(/(^|,)(\s*)([^,\s]+)([^,]*)/g, (match, separator: string, whitespace: string, url: string, descriptor: string) => {
    const token = createAssetToken(url, htmlId, assets);
    if (token == null) return match;
    changed = true;
    return `${separator}${whitespace}${token.token}${descriptor}`;
  });

  if (changed) {
    replacements.push({ ...valueLocation, value: srcset });
  }
}

function createAssetToken(specifier: string, htmlId: string, assets: AssetToken[]): AssetToken | undefined {
  if (!shouldBundleAsset(specifier, htmlId)) return void 0;
  const importSpecifier = specifier.startsWith('.') ? specifier : `./${specifier}`;
  const existingAsset = assets.find(asset => asset.specifier === importSpecifier);
  if (existingAsset != null) return existingAsset;

  const token = `__au_vite_asset_${assets.length}__`;
  const asset = {
    token,
    variable: `__auViteAsset${assets.length}`,
    specifier: importSpecifier,
  };
  assets.push(asset);
  return asset;
}

function shouldBundleAsset(specifier: string, htmlId: string): boolean {
  if (
    specifier === ''
    || specifier.includes('${')
    || specifier.startsWith('/')
    || specifier.startsWith('#')
    || /^[a-z][a-z\d+.-]*:/i.test(specifier)
    || specifier.startsWith('//')
  ) {
    return false;
  }

  const filePath = getFilePath(specifier);
  if (filePath == null) return false;

  const resolved = resolve(dirname(htmlId), filePath);
  try {
    return statSync(resolved).isFile();
  } catch {
    return false;
  }
}

function getFilePath(specifier: string): string | undefined {
  const [filePath] = specifier.split(/[?#]/, 1);
  if (filePath === '') return void 0;
  try {
    return decodeURI(filePath);
  } catch {
    return void 0;
  }
}

function getAttributeValueLocation(html: string, attrLocation: AttributeLocation): { start: number; end: number } | undefined {
  const raw = html.slice(attrLocation.startOffset, attrLocation.endOffset);
  const equals = raw.indexOf('=');
  if (equals < 0) return void 0;

  let start = attrLocation.startOffset + equals + 1;
  while (/\s/.test(html[start])) {
    start++;
  }

  const quote = html[start];
  if (quote === '"' || quote === "'") {
    return { start: start + 1, end: attrLocation.endOffset - 1 };
  }

  return { start, end: attrLocation.endOffset };
}

function applyReplacements(html: string, replacements: Replacement[]): string {
  return replacements
    .sort((a, b) => b.start - a.start)
    .reduce((output, replacement) => {
      return `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
    }, html);
}

function createTemplateExpression(html: string, assets: AssetToken[]): string {
  const tokenToVariable = new Map(assets.map(asset => [asset.token, asset.variable]));
  const tokenPattern = new RegExp(assets.map(asset => asset.token).join('|'), 'g');
  const parts: string[] = [];
  let offset = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(html)) !== null) {
    if (match.index > offset) {
      parts.push(JSON.stringify(html.slice(offset, match.index)));
    }
    parts.push(tokenToVariable.get(match[0])!);
    offset = match.index + match[0].length;
  }

  if (offset < html.length) {
    parts.push(JSON.stringify(html.slice(offset)));
  }

  return parts.join(' + ');
}
