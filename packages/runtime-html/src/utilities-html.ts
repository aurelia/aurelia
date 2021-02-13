import type { ISVGAnalyzer } from './observation/svg-analyzer';

const IsDataAttribute: Record<string, boolean> = createLookup();

export function isDataAttribute(obj: Node, key: PropertyKey, svgAnalyzer: ISVGAnalyzer): boolean {
  if (IsDataAttribute[key as string] === true) {
    return true;
  }
  if (typeof key !== 'string') {
    return false;
  }
  const prefix = key.slice(0, 5);
  // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
  // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
  return IsDataAttribute[key] =
    prefix === 'aria-' ||
    prefix === 'data-' ||
    svgAnalyzer.isStandardSvgAttribute(obj, key);
}

export function createLookup<T = unknown>(){
  return Object.create(null) as Record<string, T>;
}
