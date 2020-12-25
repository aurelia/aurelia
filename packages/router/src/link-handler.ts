import { bound, DI } from '@aurelia/kernel';
import { CustomAttribute, IWindow } from '@aurelia/runtime-html';

import { LoadCustomAttribute } from './resources/load.js';
import { IRouter } from './router.js';

export interface IMouseEvent extends MouseEvent {}
export interface IElement extends Element {}
export interface IHTMLElement extends HTMLElement {}

/**
 * Provides information about how to handle an anchor event.
 *
 * @internal
 */
export interface AnchorEventInfo {
  /**
   * Indicates whether the event should be handled or not.
   */
  shouldHandleEvent: boolean;
  /**
   * The instruction (href) of the link or null if not-applicable.
   */
  instruction: string | null;
  /**
   * The anchor element or null if not-applicable.
   */
  anchor: Element | null;
}

export interface ILinkHandler extends LinkHandler {}
export const ILinkHandler = DI.createInterface<ILinkHandler>('ILinkHandler', x => x.singleton(LinkHandler));

/**
 * Class responsible for handling interactions that should trigger navigation.
 *
 * @internal
 */
export class LinkHandler {
  public constructor(
    @IWindow private readonly window: IWindow,
    @IRouter private readonly router: IRouter,
  ) {}

  /**
   * Gets the href and a "should handle" recommendation, given an Event.
   *
   * @param event - The Event to inspect for target anchor and href.
   */
  private getEventInfo(event: IMouseEvent): AnchorEventInfo {
    const info: AnchorEventInfo = {
      shouldHandleEvent: false,
      instruction: null,
      anchor: null
    };

    const target = info.anchor = event.currentTarget as Element | null;
    // Switch to this for delegation:
    // const target = info.anchor = LinkHandler.closestAnchor(event.target as Element);
    if (target === null || !this.targetIsThisWindow(target)) {
      return info;
    }

    if (target.hasAttribute('external')) {
      return info;
    }

    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return info;
    }

    const loadAttr = CustomAttribute.for<LoadCustomAttribute>(target, 'load');
    const load = (loadAttr?.viewModel.value ?? null) as string | null;
    const href = this.router.options.useHref && target.hasAttribute('href') ? target.getAttribute('href') : null;
    if ((load === null || load.length === 0) && (href === null || href.length === 0)) {
      return info;
    }

    info.anchor = target;
    info.instruction = load ?? href;

    const leftButtonClicked: boolean = event.button === 0;

    info.shouldHandleEvent = leftButtonClicked;
    return info;
  }

  /**
   * Gets a value indicating whether or not an anchor targets the current window.
   *
   * @param target - The anchor element whose target should be inspected.
   * @returns True if the target of the link element is this window; false otherwise.
   */
  private targetIsThisWindow(target: IElement): boolean {
    const targetWindow = target.getAttribute('target');

    return (
      targetWindow === null ||
      targetWindow === this.window.name ||
      targetWindow === '_self'
    );
  }

  @bound
  public onClick(e: IMouseEvent): void {
    const info = this.getEventInfo(e);

    if (info.shouldHandleEvent) {
      e.preventDefault();
      this.router.load(info.instruction ?? '', { context: info.anchor }).catch(err => Promise.reject(err));
    }
  }
}
