import { IHistoryEntry, HistoryBrowser } from './history-browser';
import { Viewport } from './viewport';
import { IContainer, inject } from '@aurelia/kernel';

export interface IRoute {
  name: string;
  path: string;
  title?: string;
  viewports: Object;
  meta?: Object;
}

export interface IRouteViewport {
  name: string;
  component: any;
}

@inject(IContainer)
export class Router {
  public routes: IRoute[] = [];
  public viewports: Object = {};

  private options: any;
  private isActive: boolean = false;

  public historyBrowser: HistoryBrowser;

  constructor(private container: IContainer) {
    this.historyBrowser = new HistoryBrowser();
  }

  public activate(options?: Object): void {
    if (this.isActive) {
      throw new Error('Router has already been activated.');
    }

    this.isActive = true;
    this.options = Object.assign({}, {
      callback: (entry, flags) => {
        this.historyCallback(entry, flags);
      }
    }, options);

    this.historyBrowser.activate(this.options);
  }

  public historyCallback(entry: IHistoryEntry, flags: any): Promise<void> {
    if (this.options.reportCallback) {
      this.options.reportCallback(entry, flags);
    }

    const route: IRoute = this.findRoute(entry);
    if (!route) {
      return;
    }
    if (route.title) {
      this.historyBrowser.setEntryTitle(route.title);
    }

    const viewports: Viewport[] = [];
    for (const vp in route.viewports) {
      const routeViewport: IRouteViewport = route.viewports[vp];
      const viewport = this.findViewport(vp);
      if (viewport.setNextContent(routeViewport.component)) {
        viewports.push(viewport);
      }
    }

    let cancel: boolean = false;
    return Promise.all(viewports.map((value) => value.canLeave()))
      .then((promises: boolean[]) => {
        if (!flags.isCancel && promises.findIndex((value) => value === false) >= 0) {
          cancel = true;
          return Promise.resolve([]);
        } else {
          return Promise.all(viewports.map((value) => value.canEnter()));
        }
      }).then((promises: boolean[]) => {
        if (!flags.isCancel && promises.findIndex((value) => value === false) >= 0) {
          cancel = true;
          return Promise.resolve([]);
        } else {
          return Promise.all(viewports.map((value) => value.loadContent()));
        }
        // No need to check this for false/failures, right?
        // }).then((promises: boolean[]) => {
        //   if (promises.findIndex((value) => value === false) >= 0) {
        //     cancel = true;
        //   }
        //   return Promise.resolve();
      }).then(() => {
        if (cancel) {
          this.historyBrowser.cancel();
        }
      });
  }

  public findRoute(entry: IHistoryEntry): IRoute {
    return this.routes.find((value) => value.path === entry.path);
  }

  public findViewport(name: string): Viewport {
    return this.viewports[name];
  }

  public renderViewports(viewports: Viewport[]): void {
    for (const viewport of viewports) {
      viewport.loadContent();
    }
  }

  public addViewport(name: string, element: Element, controller: any): Viewport {
    return this.viewports[name] = new Viewport(this.container, name, element, controller);
  }

  public addRoute(route: IRoute): void {
    this.routes.push(route);
  }
}
