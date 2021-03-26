import { DI } from '@aurelia/kernel';
import { IWindow, CustomAttribute } from '@aurelia/runtime-html';
import { GotoCustomAttribute } from './goto.js';
import { LoadCustomAttribute } from './load.js';
import { IRouter } from '../router.js';

export const ILinkHandler = DI.createInterface<ILinkHandler>('ILinkHandler', x => x.singleton(LinkHandler));

export interface ILinkHandler extends LinkHandler { }

/**
 * Class responsible for handling interactions that should trigger navigation.
 */
export class LinkHandler implements EventListenerObject {
  public constructor(
    @IWindow private readonly window: IWindow,
    @IRouter private readonly router: IRouter,
  ) { }

  public handleEvent(e: Event): void {
    this.handleClick(e as MouseEvent);
  }

  private handleClick(event: MouseEvent): void {
    // Only process clean left click
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    const target = event.currentTarget as Element;

    // Ignore links with the `external` attribute
    if (target.hasAttribute('external')) {
      return;
    }

    // Only process links into this window
    const targetWindow = target.getAttribute('target') ?? '';
    if (targetWindow.length > 0 && targetWindow !== this.window.name && targetWindow !== '_self') {
      return;
    }

    const gotoAttr = CustomAttribute.for(target, 'goto');
    const goto = gotoAttr !== void 0 ? (gotoAttr.viewModel as GotoCustomAttribute).value as string : null;
    const loadAttr = CustomAttribute.for(target, 'load');
    const load = loadAttr !== void 0 ? (loadAttr.viewModel as LoadCustomAttribute).value as string : null;
    const href = this.router.configuration.options.useHref && target.hasAttribute('href') ? target.getAttribute('href') : null;

    // Ignore empty links
    if ((goto === null || goto.length === 0) && (load === null || load.length === 0) && (href === null || href.length === 0)) {
      return;
    }

    // This link is for us, so prevent default behaviour
    event.preventDefault();

    let instruction = load ?? goto ?? href ?? '';
    if (typeof instruction === 'string' && instruction.startsWith('#')) {
      instruction = instruction.slice(1);
      // '#' === '/' === '#/'
      // TODO: Investigate if this is still valid (don't think so)
      if (!instruction.startsWith('/')) {
        instruction = `/${instruction}`;
      }
    }
    this.router.load(instruction, { origin: target }).catch(error => { throw error; });
  }
}
