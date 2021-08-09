import type { ISVGAnalyzer } from './observation/svg-analyzer';

/** @internal */
export const createLookup = <T = unknown>() => Object.create(null) as Record<string, T>;

/** @internal */
export const hasOwnProperty = Object.prototype.hasOwnProperty;

const IsDataAttribute: Record<string, boolean> = createLookup();
/** @internal */
export const isDataAttribute = (obj: Node, key: PropertyKey, svgAnalyzer: ISVGAnalyzer): boolean => {
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
};
