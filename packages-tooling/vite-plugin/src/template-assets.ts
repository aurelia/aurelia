import type { IFileUnit, IFileUnitHost, IHtmlTransformResult } from '@aurelia/plugin-conventions';
import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap, Token } from 'parse5';

type DefaultTreeNode = DefaultTreeAdapterMap['node'];
type DefaultTreeElement = DefaultTreeAdapterMap['element'];
type DefaultTreeTemplate = DefaultTreeAdapterMap['template'];
type AttributeLocation = Token.Location;

interface HtmlAssetAttributes {
  src?: readonly string[];
  srcset?: readonly string[];
  filter?: (attributes: ReadonlyMap<string, string>) => boolean;
}

const allowedMetaNames = new Set([
  'msapplication-tileimage',
  'msapplication-square70x70logo',
  'msapplication-square150x150logo',
  'msapplication-wide310x150logo',
  'msapplication-square310x310logo',
  'msapplication-config',
  'twitter:image',
]);
const allowedMetaProperties = new Set([
  'og:image',
  'og:image:url',
  'og:image:secure_url',
  'og:audio',
  'og:audio:secure_url',
  'og:video',
  'og:video:secure_url',
]);
const ignoreAttribute = 'au-vite-ignore';
const htmlAssetAttributes: Record<string, HtmlAssetAttributes> = {
  audio: { src: ['src'] },
  embed: { src: ['src'] },
  img: { src: ['src'], srcset: ['srcset'] },
  image: { src: ['href', 'xlink:href'] },
  input: { src: ['src'] },
  link: { src: ['href'], srcset: ['imagesrcset'] },
  meta: { src: ['content'], filter: isAssetMeta },
  object: { src: ['data'] },
  source: { src: ['src'], srcset: ['srcset'] },
  track: { src: ['src'] },
  use: { src: ['href', 'xlink:href'] },
  video: { src: ['src', 'poster'] },
};

interface Replacement {
  start: number;
  end: number;
  // A JavaScript string expression, rather than already-serialized HTML.
  value: string;
}

interface AssetImport {
  variable: string;
  specifier: string;
}

export function transformTemplateAssetUrls(
  html: string,
  unit: IFileUnit,
  host: IFileUnitHost,
  reportMissingAsset: (specifier: string) => void,
): IHtmlTransformResult | undefined {
  const replacements: Replacement[] = [];
  const assets: AssetImport[] = [];
  const fileExistsCache = new Map<string, boolean>();
  const tree = parseFragment(html, { sourceCodeLocationInfo: true });

  visitElements(tree.childNodes, (node) => {
    const attrs = getAttributes(node);
    if (attrs.has(ignoreAttribute)) {
      const loc = node.sourceCodeLocation?.attrs?.[ignoreAttribute];
      if (loc != null) {
        replacements.push({ start: loc.startOffset, end: loc.endOffset, value: '""' });
      }
      return;
    }

    const assetAttrs = htmlAssetAttributes[node.nodeName];
    if (assetAttrs == null) return;
    if (assetAttrs.filter?.(attrs) === false) return;

    assetAttrs.src?.forEach((name) => {
      const value = attrs.get(name);
      const loc = node.sourceCodeLocation?.attrs?.[name];
      if (value == null || loc == null) return;

      const expression = createAssetExpression(value, unit, host, assets, fileExistsCache, reportMissingAsset);
      if (expression == null) return;
      const valueLocation = getAttributeValueLocation(html, loc);
      if (valueLocation == null) return;
      replacements.push({ ...valueLocation, value: quoteAttribute(expression) });
    });

    assetAttrs.srcset?.forEach((name) => {
      const value = attrs.get(name);
      const loc = node.sourceCodeLocation?.attrs?.[name];
      if (value == null || loc == null) return;
      replaceSrcset(value, loc, html, unit, host, replacements, assets, fileExistsCache, reportMissingAsset);
    });
  });

  if (replacements.length === 0) return void 0;

  const imports = assets.map(asset => `import ${asset.variable} from ${JSON.stringify(asset.specifier)};\n`);
  return {
    imports,
    templateExpression: createStringExpression(html, replacements),
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

function isAssetMeta(attributes: ReadonlyMap<string, string>): boolean {
  const name = attributes.get('name')?.trim().toLowerCase();
  if (name != null && allowedMetaNames.has(name)) return true;

  const property = attributes.get('property')?.trim().toLowerCase();
  return property != null && allowedMetaProperties.has(property);
}

function replaceSrcset(
  value: string,
  attrLocation: AttributeLocation,
  html: string,
  unit: IFileUnit,
  host: IFileUnitHost,
  replacements: Replacement[],
  assets: AssetImport[],
  fileExistsCache: Map<string, boolean>,
  reportMissingAsset: (specifier: string) => void,
): void {
  const valueLocation = getAttributeValueLocation(html, attrLocation);
  if (valueLocation == null) return;

  const urls: Replacement[] = [];
  // HTML collects a URL up to ASCII whitespace, then strips trailing commas.
  // Commas inside a data URL or filename belong to that URL, not a new candidate.
  // Only find boundaries here; descriptor validity remains the browser's concern.
  const candidates = /[^\t\n\f\r ,][^\t\n\f\r ]*/g;
  let match: RegExpExecArray | null;
  while ((match = candidates.exec(value)) !== null) {
    const url = match[0].replace(/,+$/, '');
    const expression = createAssetExpression(url, unit, host, assets, fileExistsCache, reportMissingAsset);
    if (expression != null) {
      urls.push({ start: match.index, end: match.index + url.length, value: expression });
    }
    if (url.length === match[0].length) {
      // Parenthesized descriptors may contain commas. Skip the descriptor as a
      // unit so its contents cannot be mistaken for another relative asset.
      let inParens = false;
      while (candidates.lastIndex < value.length) {
        const char = value[candidates.lastIndex++];
        if (char === '(') inParens = true;
        else if (char === ')') inParens = false;
        else if (char === ',' && !inParens) break;
      }
    }
  }

  if (urls.length > 0) {
    replacements.push({ ...valueLocation, value: quoteAttribute(createStringExpression(value, urls)) });
  }
}

function createAssetExpression(
  specifier: string,
  unit: IFileUnit,
  host: IFileUnitHost,
  assets: AssetImport[],
  fileExistsCache: Map<string, boolean>,
  reportMissingAsset: (specifier: string) => void,
): string | undefined {
  if (
    specifier === ''
    || specifier.includes('${')
    || specifier.startsWith('/')
    || specifier.startsWith('#')
    || /^[a-z][a-z\d+.-]*:/i.test(specifier)
  ) {
    return void 0;
  }

  const [, encodedPath, query = '', hash = ''] = /^([^?#]*)(\?[^#]*)?(#.*)?$/s.exec(specifier)!;
  let filePath: string;
  try {
    filePath = decodeURIComponent(encodedPath);
  } catch {
    return void 0;
  }
  if (filePath === '') return void 0;
  const relativePath = filePath.startsWith('.') ? filePath : `./${filePath}`;
  let exists = fileExistsCache.get(relativePath);
  if (exists == null) {
    exists = host.fileExists(unit, relativePath);
    fileExistsCache.set(relativePath, exists);
    if (!exists) reportMissingAsset(specifier);
  }
  if (!exists) {
    return void 0;
  }

  // Vite module ids use these characters as delimiters even after URL decoding.
  // This restriction can be removed when Vite supports them in filename imports.
  if (/[?#]/.test(filePath)) {
    throw new Error(`Template asset ${JSON.stringify(specifier)} in ${JSON.stringify(unit.path)} has a filename containing "?" or "#", which Vite cannot resolve. Rename the file to remove these characters.`);
  }
  if (/(?:^\?|&)raw(?:&|$)/.test(query)) {
    throw new Error(`Template asset ${JSON.stringify(specifier)} in ${JSON.stringify(unit.path)} uses "?raw", which imports source text instead of a URL. Remove "raw" to load the file as an asset. For source text, import it explicitly in your component code.`);
  }

  // These are HTML URLs, including CSS/JSON/HTML files, not module values.
  // A fragment selects part of the returned resource, not a different module.
  // SVG fragments need an external file (e.g. <use href="icons.svg#check">).
  let importQuery = /(?:^\?|&)url(?:&|$)/.test(query) ? query : `?url${query === '' ? '' : `&${query.slice(1)}`}`;
  if (hash !== '' && /\.svg$/i.test(filePath) && !/(?:^\?|&)(?:inline|no-inline)(?:&|$)/.test(query)) {
    importQuery += '&no-inline';
  }
  const importSpecifier = `${relativePath}${importQuery}`;
  let asset = assets.find(asset => asset.specifier === importSpecifier);
  if (asset == null) {
    asset = { variable: `__auViteAsset${assets.length}`, specifier: importSpecifier };
    assets.push(asset);
  }
  return hash === '' ? asset.variable : `${asset.variable} + ${JSON.stringify(hash)}`;
}

function getAttributeValueLocation(html: string, attrLocation: AttributeLocation): { start: number; end: number } | undefined {
  const raw = html.slice(attrLocation.startOffset, attrLocation.endOffset);
  const equals = raw.indexOf('=');
  if (equals < 0) return void 0;

  let start = attrLocation.startOffset + equals + 1;
  while (/\s/.test(html[start])) {
    start++;
  }

  // Replace the quotes too, so bare and single-quoted attributes use the same
  // escaping as double-quoted attributes after Vite supplies their final URL.
  return { start, end: attrLocation.endOffset };
}

function quoteAttribute(expression: string): string {
  // URLs can contain quotes or HTML entities (notably inlined SVG). Escape after
  // resolving imports so parsing the template recovers the exact original URL.
  return `'"' + (${expression}).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"'`;
}

function createStringExpression(value: string, replacements: Replacement[]): string {
  const parts: string[] = [];
  let offset = 0;
  for (const replacement of replacements.sort((a, b) => a.start - b.start)) {
    if (replacement.start > offset) {
      parts.push(JSON.stringify(value.slice(offset, replacement.start)));
    }
    parts.push(replacement.value);
    offset = replacement.end;
  }
  if (offset < value.length) {
    parts.push(JSON.stringify(value.slice(offset)));
  }
  return parts.join(' + ');
}
