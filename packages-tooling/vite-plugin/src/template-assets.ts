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
  value: string;
}

interface AssetToken {
  token: string;
  variable: string;
  specifier: string;
}

export function transformTemplateAssetUrls(
  html: string,
  unit: IFileUnit,
  host: IFileUnitHost,
  warn: (message: string) => void,
): IHtmlTransformResult | undefined {
  const replacements: Replacement[] = [];
  const assets: AssetToken[] = [];
  const fileExistsCache = new Map<string, boolean>();
  const tree = parseFragment(html, { sourceCodeLocationInfo: true });

  visitElements(tree.childNodes, (node) => {
    const attrs = getAttributes(node);
    if (attrs.has(ignoreAttribute)) {
      const loc = node.sourceCodeLocation?.attrs?.[ignoreAttribute];
      if (loc != null) {
        replacements.push({ start: loc.startOffset, end: loc.endOffset, value: '' });
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

      const token = createAssetToken(value, unit, host, assets, fileExistsCache, warn);
      if (token == null) return;
      const valueLocation = getAttributeValueLocation(html, loc);
      if (valueLocation == null) return;
      replacements.push({ ...valueLocation, value: token.token });
    });

    assetAttrs.srcset?.forEach((name) => {
      const value = attrs.get(name);
      const loc = node.sourceCodeLocation?.attrs?.[name];
      if (value == null || loc == null) return;
      replaceSrcset(value, loc, html, unit, host, replacements, assets, fileExistsCache, warn);
    });
  });

  if (replacements.length === 0) return void 0;

  const transformedHtml = applyReplacements(html, replacements);
  const imports = assets.map(asset => `import ${asset.variable} from ${JSON.stringify(asset.specifier)};\n`);
  return {
    imports,
    templateExpression: assets.length === 0 ? JSON.stringify(transformedHtml) : createTemplateExpression(transformedHtml, assets),
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
  assets: AssetToken[],
  fileExistsCache: Map<string, boolean>,
  warn: (message: string) => void,
): void {
  const valueLocation = getAttributeValueLocation(html, attrLocation);
  if (valueLocation == null) return;

  let changed = false;
  const srcset = value.replace(/(^|,)(\s*)([^,\s]+)([^,]*)/g, (match, separator: string, whitespace: string, url: string, descriptor: string) => {
    const token = createAssetToken(url, unit, host, assets, fileExistsCache, warn);
    if (token == null) return match;
    changed = true;
    return `${separator}${whitespace}${token.token}${descriptor}`;
  });

  if (changed) {
    replacements.push({ ...valueLocation, value: srcset });
  }
}

function createAssetToken(
  specifier: string,
  unit: IFileUnit,
  host: IFileUnitHost,
  assets: AssetToken[],
  fileExistsCache: Map<string, boolean>,
  warn: (message: string) => void,
): AssetToken | undefined {
  const importSpecifier = specifier.startsWith('.') ? specifier : `./${specifier}`;
  const existingAsset = assets.find(asset => asset.specifier === importSpecifier);
  if (existingAsset != null) return existingAsset;
  if (!shouldBundleAsset(specifier, unit, host, fileExistsCache, warn)) return void 0;

  const token = `__au_vite_asset_${assets.length}__`;
  const asset = {
    token,
    variable: `__auViteAsset${assets.length}`,
    specifier: importSpecifier,
  };
  assets.push(asset);
  return asset;
}

function shouldBundleAsset(
  specifier: string,
  unit: IFileUnit,
  host: IFileUnitHost,
  fileExistsCache: Map<string, boolean>,
  warn: (message: string) => void,
): boolean {
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

  const relativePath = filePath.startsWith('.') ? filePath : `./${filePath}`;
  const cached = fileExistsCache.get(relativePath);
  if (cached != null) return cached;

  const exists = host.fileExists(unit, relativePath);
  fileExistsCache.set(relativePath, exists);
  if (!exists) {
    warn(`Unable to resolve template asset ${JSON.stringify(specifier)} referenced by ${JSON.stringify(unit.path)}. The URL will be left unchanged.`);
  }
  return exists;
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
