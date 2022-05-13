// /**
//  * Copied from https://gist.github.com/strothj/708afcf4f01dd04de8f49c92e88093c3
//  */

// export interface ResizeObserverConstructor {
//   new(callback: ResizeObserverCallback): ResizeObserver;
//   prototype: ResizeObserver;
// }

// /**
//  * The ResizeObserver interface is used to observe changes to Element's content
//  * rect.
//  *
//  * It is modeled after MutationObserver and IntersectionObserver.
//  */
// export interface ResizeObserver {
//   new(callback: ResizeObserverCallback);

//   /**
//    * Adds target to the list of observed elements.
//    */
//   observe: (target: Element) => void;

//   /**
//    * Removes target from the list of observed elements.
//    */
//   unobserve: (target: Element) => void;

//   /**
//    * Clears both the observationTargets and activeTargets lists.
//    */
//   disconnect: () => void;
// }

// /**
//  * This callback delivers ResizeObserver's notifications. It is invoked by a
//  * broadcast active observations algorithm.
//  */
// export interface ResizeObserverCallback {
//   (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
// }

// export interface ResizeObserverEntry {
//   /**
//    * @param target - The Element whose size has changed.
//    */
//   new(target: Element);

//   /**
//    * The Element whose size has changed.
//    */
//   readonly target: Element;

//   /**
//    * Element's content rect when ResizeObserverCallback is invoked.
//    */
//   readonly contentRect: DOMRectReadOnly;
// }

// export declare class DOMRectReadOnly {
//   static fromRect(other: DOMRectInit | undefined): DOMRectReadOnly;

//   readonly x: number;
//   readonly y: number;
//   readonly width: number;
//   readonly height: number;
//   readonly top: number;
//   readonly right: number;
//   readonly bottom: number;
//   readonly left: number;

//   toJSON: () => any;
// }

// // declare global {
// //   interface Window {
// //     ResizeObserver: ResizeObserverConstructor;
// //   }
// // }
