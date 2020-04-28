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
  INavigatorViewerEvent,
  Navigator,
} from '@aurelia/router';

import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { INavClasses } from './resources/nav';
import { BrowserViewerStore } from './browser-viewer-store';

export interface IHTMLRouter extends IRouter {
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

export class HTMLRouter extends Router implements IHTMLRouter {
  public navs: Record<string, Nav> = {};
  private loadedFirst: boolean = false;

  public constructor(
    @IContainer container: IContainer,
    navigator: Navigator,
    instructionResolver: InstructionResolver,
    hookManager: HookManager,
    public navigation: BrowserViewerStore,
    public linkHandler: LinkHandler,
  ) {
    super(container, navigator, instructionResolver, hookManager);
  }

  public activate(options?: IRouterOptions): void {
    super.activate(options);

    this.navigator.activate(this, {
      callback: this.navigatorCallback,
      store: this.navigation,
      statefulHistoryLength: this.options.statefulHistoryLength,
      serializeCallback: this.statefulHistory ? this.navigatorSerializeCallback : void 0,
    });

    this.linkHandler.activate({
      callback: this.linkCallback,
      useHref: this.options.useHref,
    });

    this.navigation.activate({
      callback: this.browserNavigatorCallback,
      useUrlFragmentHash: this.options.useUrlFragmentHash,
    });
  }

  public deactivate(): void {
    super.deactivate();

    this.linkHandler.deactivate();
    this.navigation.deactivate();
  }

   public async loadUrl(): Promise<void> {
     const entry: INavigatorEntry = {
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

  // TODO: use @bound and improve name (eslint-disable is temp)
  // eslint-disable-next-line @typescript-eslint/typedef
  public browserNavigatorCallback = (browserNavigationEvent: INavigatorViewerEvent): void => {
    const entry: INavigatorEntry = (browserNavigationEvent.state && browserNavigationEvent.state.currentEntry
      ? browserNavigationEvent.state.currentEntry as INavigatorEntry
      : { instruction: '', fullStateInstruction: '' });
    entry.instruction = browserNavigationEvent.instruction;
    entry.fromBrowser = true;
    this.navigator.navigate(entry).catch(error => { throw error; });
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
