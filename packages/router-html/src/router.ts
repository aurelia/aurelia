/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  DI,
  IContainer,
} from '@aurelia/kernel';

import {
  Router,
  IRouter,
  InstructionResolver,
  HookManager,
  IRouterOptions,
  INavigatorEntry,
  Navigator,
  IRouterEvents,
} from '@aurelia/router';

import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { INavClasses } from './resources/nav';
import { BrowserViewerStore } from './browser-viewer-store';
import { HTMLStateManager } from './state-manager';
import { IScheduler } from '@aurelia/runtime';

export interface IHTMLRouter extends IRouter<Element> {
  readonly navigation: BrowserViewerStore;
  readonly linkHandler: LinkHandler;
  readonly navs: Readonly<Record<string, Nav>>;

  loadUrl(): Promise<void>;

  setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
  updateNav(name?: string): void;
  findNav(name: string): Nav;
}

export const IHTMLRouter = DI.createInterface<IHTMLRouter>('IHTMLRouter').withDefault(x => x.singleton(HTMLRouter));

export class HTMLRouter extends Router<Element> implements IHTMLRouter {
  public navs: Record<string, Nav> = {};
  private loadedFirst: boolean = false;

  public constructor(
    @IContainer container: IContainer,
    @IRouterEvents events: IRouterEvents,
    @IScheduler scheduler: IScheduler,
    navigator: Navigator<Element>,
    instructionResolver: InstructionResolver<Element>,
    hookManager: HookManager<Element>,
    public navigation: BrowserViewerStore,
    public linkHandler: LinkHandler,
    stateManager: HTMLStateManager,
  ) {
    super(
      container,
      events,
      scheduler,
      navigator,
      instructionResolver,
      hookManager,
      stateManager,
    );
  }

  public activate(options?: IRouterOptions<Element>): void {
    super.activate(options);

    this.navigator.activate(this, {
      store: this.navigation,
      statefulHistoryLength: this.options.statefulHistoryLength,
      serializeCallback: this.statefulHistory ? this.navigatorSerializeCallback : void 0,
    });

    this.linkHandler.activate({
      callback: this.linkCallback,
      useHref: this.options.useHref,
    });

    this.navigation.activate({
      useUrlFragmentHash: this.options.useUrlFragmentHash,
    });
  }

  public deactivate(): void {
    super.deactivate();

    this.linkHandler.deactivate();
    this.navigation.deactivate();
  }

  public async loadUrl(): Promise<void> {
    const entry: INavigatorEntry<Element> = {
      ...this.navigation.viewerState,
      ...{
        fullStateInstruction: '',
        replacing: true,
        fromBrowser: false,
      }
    };
    const result = this.navigator.navigate(entry);
    this.loadedFirst = true;
    return result;
  }

  // TODO: use @bound and improve name (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  public linkCallback = (info: AnchorEventInfo): void => {
    let instruction = info.instruction || '';
    if (typeof instruction === 'string' && instruction.startsWith('#')) {
      instruction = instruction.slice(1);
      // '#' === '/' === '#/'
      if (!instruction.startsWith('/')) {
        instruction = `/${instruction}`;
      }
    }
    // Adds to Navigator's Queue, which makes sure it's serial
    this.goto(instruction, { origin: info.anchor! }).catch(error => { throw error; });
  };
  public setNav(name: string, routes: INavRoute[], classes?: INavClasses): void {
    const nav = this.findNav(name);
    if (nav !== void 0 && nav !== null) {
      nav.routes = [];
    }
    this.addNav(name, routes, classes);
  }
  public addNav(name: string, routes: INavRoute[], classes?: INavClasses): void {
    let nav = this.navs[name];
    if (nav === void 0 || nav === null) {
      nav = this.navs[name] = new Nav(this, name, [], classes);
    }
    nav.addRoutes(routes);
    nav.update();
  }
  public updateNav(name?: string): void {
    const navs = name
      ? [name]
      : Object.keys(this.navs);
    for (const nav of navs) {
      if (this.navs[nav] !== void 0 && this.navs[nav] !== null) {
        this.navs[nav].update();
      }
    }
  }
  public findNav(name: string): Nav {
    return this.navs[name];
  }
}
