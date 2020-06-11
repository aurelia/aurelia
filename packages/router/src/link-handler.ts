import {
  bound, DI,
} from '@aurelia/kernel';
import {
  CustomAttribute,
} from '@aurelia/runtime';

import {
  GotoCustomAttribute,
} from './resources/goto';
import {
  IWindow,
} from './interfaces';
import {
  IRouter,
} from './router';

/**
 * Provides information about how to handle an anchor event.
 *
 * @internal - Shouldn't be used directly.
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
export const ILinkHandler = DI.createInterface<ILinkHandler>('ILinkHandler').withDefault(x => x.singleton(LinkHandler));

/**
 * Class responsible for handling interactions that should trigger navigation.
 *
 * @internal - Shouldn't be used directly.
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
  private getEventInfo(event: MouseEvent): AnchorEventInfo {
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

    const gotoAttr = CustomAttribute.for<Element, GotoCustomAttribute>(target, 'goto');
    const goto = (gotoAttr?.viewModel.value ?? null) as string | null;
    const href = this.router.options.useHref && target.hasAttribute('href') ? target.getAttribute('href') : null;
    if ((goto === null || goto.length === 0) && (href === null || href.length === 0)) {
      return info;
    }

    info.anchor = target;
    info.instruction = goto ?? href;

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
  private targetIsThisWindow(target: Element): boolean {
    const targetWindow = target.getAttribute('target');

    return (
      targetWindow === null ||
      targetWindow === this.window.name ||
      targetWindow === '_self'
    );
  }

  @bound
  public onClick(e: MouseEvent): void {
    const info = this.getEventInfo(e);

    if (info.shouldHandleEvent) {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/promise-function-async
      this.router.load(info.instruction ?? '', { context: info.anchor }).catch(err => Promise.reject(err));
    }
  }
}
