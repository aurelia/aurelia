/**
 * Copied from https://gist.github.com/strothj/708afcf4f01dd04de8f49c92e88093c3
 */

interface Window {
  ResizeObserver: ResizeObserver;
}

/**
 * The ResizeObserver interface is used to observe changes to Element's content
 * rect.
 *
 * It is modeled after MutationObserver and IntersectionObserver.
 */
interface ResizeObserver {
  new (callback: ResizeObserverCallback): ResizeObserver;

  /**
   * Adds target to the list of observed elements.
   */
  observe: (target: Element, options?: ResizeObserverOptions) => void;

  /**
   * Removes target from the list of observed elements.
   */
  unobserve: (target: Element) => void;

  /**
   * Clears both the observationTargets and activeTargets lists.
   */
  disconnect: () => void;
}

/**
 * Options to be given to the resize observer,
 * when oberving a new element.
 *
 * https://drafts.csswg.org/resize-observer-1/#dictdef-resizeobserveroptions
 */
interface ResizeObserverOptions {
  box: 'border-box' | 'content-box' | undefined;
}


/**
 * This callback delivers ResizeObserver's notifications. It is invoked by a
 * broadcast active observations algorithm.
 */
interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

interface ResizeObserverEntry {
  /**
   * @param target The Element whose size has changed.
   */
  new (target: Element);

  /**
   * The Element whose size has changed.
   */
  public readonly target: Element;

  /**
   * Element's content rect when ResizeObserverCallback is invoked.
   */
  public readonly contentRect: DOMRectReadOnly;
  
  public readonly borderBoxSize: ResizeObserverSize;
  public readonly contentBoxSize: ResizeObserverSize;
}

/**
 * Size of a specific box.
 * 
 * https://drafts.csswg.org/resize-observer-1/#resizeobserversize 
 */
interface ResizeObserverSize {
  /**
   * ~ width
   */
  readonly inlineSize: number;
  /**
   * ~ height
   */
  readonly blockSize: number;
}

interface DOMRectReadOnly {
  static fromRect(other: DOMRectInit | undefined): DOMRectReadOnly;

  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;

  toJSON: () => any;
}