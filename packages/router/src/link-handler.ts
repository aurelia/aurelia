/**
 * Provides information about how to handle an anchor event.
 */
export interface ILinkHandlerOptions {
  /**
   * Callback method for when a link is clicked
   */
  callback?: Function;
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
  href: string;
  /**
   * The anchor element or null if not-applicable.
   */
  anchor: Element;
}

/**
 * Class responsible for handling interactions that should trigger navigation.
 */
export class LinkHandler {
  private static window: Window;

  private options: ILinkHandlerOptions;
  private isActive: boolean = false;

  // private handler: EventListener;
  private document: Document;

  constructor() {
    this.document = document;
  }
  /**
   * Gets the href and a "should handle" recommendation, given an Event.
   *
   * @param event The Event to inspect for target anchor and href.
   */
  private static getEventInfo(event: Event): AnchorEventInfo {
    const info = {
      shouldHandleEvent: false,
      href: null,
      anchor: null
    };

    const target = LinkHandler.findClosestAnchor(<Element>event.target);
    if (!target || !LinkHandler.targetIsThisWindow(target)) {
      return info;
    }

    if (target.hasAttribute('external')) {
      return info;
    }

    if ((<MouseEvent>event).altKey || (<MouseEvent>event).ctrlKey || (<MouseEvent>event).metaKey || (<MouseEvent>event).shiftKey) {
      return info;
    }

    const href = target.getAttribute('href');
    info.anchor = target;
    info.href = href;

    const leftButtonClicked = (<MouseEvent>event).which === 1;

    info.shouldHandleEvent = leftButtonClicked;
    return info;
  }

  /**
   * Finds the closest ancestor that's an anchor element.
   *
   * @param el The element to search upward from.
   * @returns The link element that is the closest ancestor.
   */
  private static findClosestAnchor(el: Element): Element {
    while (el) {
      if (el.tagName === 'A') {
        return el;
      }
      el = <Element>el.parentNode;
    }
  }

  /**
   * Gets a value indicating whether or not an anchor targets the current window.
   *
   * @param target The anchor element whose target should be inspected.
   * @returns True if the target of the link element is this window; false otherwise.
   */
  private static targetIsThisWindow(target: Element): boolean {
    const targetWindow = target.getAttribute('target');
    const win = LinkHandler.window;

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
      throw new Error('LinkHandler has already been activated.');
    }

    this.isActive = true;
    this.options = { ...options };

    this.document.addEventListener('click', this.handler, true);
  }

  /**
   * Deactivate the instance. Event handlers and other resources should be cleaned up here.
   */
  public deactivate(): void {
    this.document.removeEventListener('click', this.handler);
    this.isActive = false;
  }

  private handler: EventListener = (e) => {
    const info = LinkHandler.getEventInfo(e);

    if (info.shouldHandleEvent) {
      e.preventDefault();
      this.options.callback(info);
    }
  };
}
