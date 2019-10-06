import { DOM } from '@aurelia/runtime-html';

/**
 * Provides information about how to handle an anchor event.
 */
export interface ILinkHandlerOptions {
  /**
   * Callback method for when a link is clicked
   */
  callback(info: AnchorEventInfo): void;
}

/**
 * Provides information about how to handle an anchor event.
 */
export interface AnchorEventInfo {
  /**
   * Indicates whether the event should be handled or not.
   */
  shouldHandleEvent: boolean;
  /**
   * The href of the link or null if not-applicable.
   */
  href: string | null;
  /**
   * The anchor element or null if not-applicable.
   */
  anchor: Element | null;
}

/**
 * Class responsible for handling interactions that should trigger navigation.
 */
export class LinkHandler {
  private options: ILinkHandlerOptions = { callback: () => { } };
  private isActive: boolean = false;

  // private handler: EventListener;

  /**
   * Gets the href and a "should handle" recommendation, given an Event.
   *
   * @param event - The Event to inspect for target anchor and href.
   */
  private static getEventInfo(event: Event): AnchorEventInfo {
    const info: AnchorEventInfo = {
      shouldHandleEvent: false,
      href: null,
      anchor: null
    };

    const target = info.anchor = LinkHandler.closestAnchor(event.target as Element);
    if (!target || !LinkHandler.targetIsThisWindow(target)) {
      return info;
    }

    if (target.hasAttribute('external')) {
      return info;
    }

    if ((event as MouseEvent).altKey || (event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey || (event as MouseEvent).shiftKey) {
      return info;
    }

    if (!target.hasAttribute('href')) {
      return info;
    }

    const href = target.getAttribute('href');
    if (!href || !href.length) {
      return info;
    }

    info.anchor = target;
    info.href = href;

    const leftButtonClicked = (event as MouseEvent).which === 1;

    info.shouldHandleEvent = leftButtonClicked;
    return info;
  }

  /**
   * Finds the closest ancestor that's an anchor element.
   *
   * @param el - The element to search upward from.
   * @returns The link element that is the closest ancestor.
   */
  private static closestAnchor(el: Element): Element | null {
    while (el !== null && el !== void 0) {
      if (el.tagName === 'A') {
        return el;
      }
      el = el.parentNode as Element;
    }
    return null;
  }

  /**
   * Gets a value indicating whether or not an anchor targets the current window.
   *
   * @param target - The anchor element whose target should be inspected.
   * @returns True if the target of the link element is this window; false otherwise.
   */
  private static targetIsThisWindow(target: Element): boolean {
    const targetWindow = target.getAttribute('target');
    const win = DOM.window;

    return !targetWindow ||
      targetWindow === win.name ||
      targetWindow === '_self';
  }

  /**
   * Activate the instance.
   *
   */
  public activate(options: ILinkHandlerOptions): void {
    if (this.isActive) {
      throw new Error('Link handler has already been activated');
    }

    this.isActive = true;
    this.options = { ...options };

    DOM.document.addEventListener('click', this.handler, true);
  }

  /**
   * Deactivate the instance. Event handlers and other resources should be cleaned up here.
   */
  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Link handler has not been activated');
    }
    DOM.document.removeEventListener('click', this.handler, true);
    this.isActive = false;
  }

  private readonly handler: EventListener = (e) => {
    const info = LinkHandler.getEventInfo(e);

    if (info.shouldHandleEvent) {
      e.preventDefault();
      this.options.callback(info);
    }
  };
}
