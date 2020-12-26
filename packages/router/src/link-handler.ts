import { DI, ILogger } from '@aurelia/kernel';
import { CustomAttribute, IWindow } from '@aurelia/runtime-html';

import { LoadCustomAttribute } from './resources/load.js';
import { IRouter } from './router.js';

export interface IMouseEvent extends MouseEvent {}
export interface IElement extends Element {}
export interface IHTMLElement extends HTMLElement {}

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
    @ILogger private readonly logger: ILogger,
  ) {
    this.logger = logger.scopeTo('LinkHandler');
  }

  public readonly onClick = (e: IMouseEvent): void => {
    // Ensure this is an ordinary left-button click.
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      this.logger.trace(`ignoring mouse event with (altKey:${e.altKey},ctrlKey:${e.ctrlKey},metaKey:${e.metaKey},shiftKey:${e.shiftKey},button:${e.button})`);
      return;
    }

    // Ensure there is an anchor tag in the composed path.
    const path = e.composedPath() as Node[];
    const anchor = path.find(isAnchor);
    if (anchor === void 0) {
      this.logger.warn(`No anchor tag in ComposedPath for event target ${(e.target as Node).nodeName}`);
      return;
    }

    // Ensure the anchor is not explicitly marked as external.
    if (anchor.hasAttribute('external') || anchor.hasAttribute('data-external')) {
      this.logger.trace(`ignoring mouse event because anchor is marked as external`);
      return;
    }

    // Ensure the anchor targets the current window.
    switch (anchor.getAttribute('target')) {
      case null:
      case this.window.name:
      case '_self':
        break;
      default:
        this.logger.trace(`ignoring mouse event because anchor does not target the current window`);
        return;
    }

    let instruction: string | null = null;
    // See if there's a `load` attribute on the anchor, if so, use its value instead of the href (if any).
    const load = CustomAttribute.for<LoadCustomAttribute>(anchor, 'load')?.viewModel.value;
    if (typeof load === 'string' && load.length > 0) {
      // TODO: are we sure that a `load` instruction with length 0 should be ignored?
      instruction = load;
    } else if (this.router.options.useHref) {
      // TODO: are we sure that a `href` attribute should be used even if its length is 0?
      instruction = anchor.getAttribute('href');
    }

    if (instruction === null) {
      this.logger.trace(`ignoring mouse event because the instruction is null`);
      return;
    }

    this.logger.trace(`loading instruction '${instruction}'`);

    e.preventDefault();
    // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
    void this.router.load(instruction, { context: anchor });
  };
}

function isAnchor(target: Node): target is HTMLAnchorElement {
  return target.nodeName === 'A';
}
