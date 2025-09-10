import { ISyntheticView } from '@aurelia/runtime-html';
/**
 * Walk up the DOM tree and determine what element will be scroller for an element
 *
 * If none is found, return `document.documentElement`
 */
export declare const getScrollerElement: (element: Node, orientation: "vertical" | "horizontal") => HTMLElement;
/**
 * Determine real distance of an element to top of current document
 */
export declare const getElementDistanceToTopOfDocument: (element: Element) => number;
/**
 * Check if an element has style scroll/auto for overflow/overflowY
 */
export declare const hasOverflowScroll: (element: Element, orientation: "vertical" | "horizontal") => boolean;
/**
 * Get total value of a list of css style property on an element
 */
export declare const getStyleValues: (element: Element, ...styles: (keyof CSSStyleDeclaration)[]) => number;
export declare const calcOuterHeight: (element: Element) => number;
export declare const calcOuterWidth: (element: Element) => number;
export declare const calcScrollerViewportHeight: (element: Element) => number;
export declare const calcScrollerViewportWidth: (element: Element) => number;
export declare const insertBeforeNode: (view: ISyntheticView, bottomBuffer: Element) => void;
/**
 * A naive utility to calculate distance of a child element to one of its ancestor, typically used for scroller/buffer combo
 * Calculation is done based on offsetTop, with formula:
 * child.offsetTop - parent.offsetTop
 * There are steps in the middle to account for offsetParent but it's basically that
 */
export declare const getDistanceToScroller: (child: HTMLElement, scroller: HTMLElement) => number;
/**
 * A naive utility to calculate horizontal distance of a child element to one of its ancestor
 * Similar to getDistanceToScroller but for horizontal positioning
 */
export declare const getHorizontalDistanceToScroller: (child: HTMLElement, scroller: HTMLElement) => number;
//# sourceMappingURL=utilities-dom.d.ts.map