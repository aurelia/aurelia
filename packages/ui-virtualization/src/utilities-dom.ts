import { ISyntheticView } from '@aurelia/runtime-html';

/**
 * Walk up the DOM tree and determine what element will be scroller for an element
 *
 * If none is found, return `document.documentElement`
 */
export const getScrollerElement = (element: Node): HTMLElement => {
  let current = element.parentNode as Element;
  while (current !== null && current !== document.body) {
    if (hasOverflowScroll(current)) {
      return current as HTMLElement;
    }
    current = current.parentNode as HTMLElement;
  }
  throw new Error('Unable to find a scroller');
};

/**
 * Determine real distance of an element to top of current document
 */
export const getElementDistanceToTopOfDocument = (element: Element): number => {
  const box = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset;
  const clientTop = document.documentElement.clientTop;
  const top = box.top + scrollTop - clientTop;
  return Math.round(top);
};

/**
 * Check if an element has style scroll/auto for overflow/overflowY
 */
export const hasOverflowScroll = (element: Element): boolean => {
  const style = window.getComputedStyle(element);
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  return style && (style.overflowY === 'scroll' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflow === 'auto');
};

/**
 * Get total value of a list of css style property on an element
 */
export const getStyleValues = (element: Element, ...styles: (keyof CSSStyleDeclaration)[]): number => {
  const currentStyle = window.getComputedStyle(element);
  let value: number = 0;
  let styleValue: number = 0;
  for (let i = 0, ii = styles.length; ii > i; ++i) {
    styleValue = parseFloat(currentStyle[styles[i]] as string);
    value += isNaN(styleValue) ? 0 : styleValue;
  }
  return value;
};

export const calcOuterHeight = (element: Element): number => {
  let height = element.getBoundingClientRect().height;
  height += getStyleValues(element, 'marginTop', 'marginBottom');
  return height;
};

export const calcScrollHeight = (element: Element): number => {
  let height = element.getBoundingClientRect().height;
  height -= getStyleValues(element, 'borderTopWidth', 'borderBottomWidth');
  return height;
};

export const insertBeforeNode = (view: ISyntheticView, bottomBuffer: Element): void => {
  // todo: account for anchor comment
  view.nodes.insertBefore(bottomBuffer);
  // bottomBuffer.parentNode.insertBefore(view.nodes.lastChild, bottomBuffer);
};

/**
 * A naive utility to calculate distance of a child element to one of its ancestor, typically used for scroller/buffer combo
 * Calculation is done based on offsetTop, with formula:
 * child.offsetTop - parent.offsetTop
 * There are steps in the middle to account for offsetParent but it's basically that
 */
export const getDistanceToScroller = (child: HTMLElement, scroller: HTMLElement): number => {
  const offsetParent = child.offsetParent as HTMLElement;
  const childOffsetTop = child.offsetTop;
  // [el] <-- offset parent === parent
  //  ...
  //   [el] <-- child
  if (offsetParent === null || offsetParent === scroller) {
    return childOffsetTop;
  }

  // [el] <-- offset parent
  //   [el] <-- parent
  //     [el] <-- child
  if (offsetParent.contains(scroller)) {
    return childOffsetTop - scroller.offsetTop;
  }

  // [el] <-- parent
  //   [el] <-- offset parent
  //     [el] <-- child
  return childOffsetTop + getDistanceToScroller(offsetParent, scroller);
};
