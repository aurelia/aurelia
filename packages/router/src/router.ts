import { IContainer, inject } from '@aurelia/kernel';
import { HistoryBrowser, IHistoryEntry, INavigationInstruction } from './history-browser';
import { Viewport } from './viewport';

export interface IRoute {
  name?: string;
  path: string;
  redirect?: string;
  title?: string;
  viewports?: Object;
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

  public historyBrowser: HistoryBrowser;

  private options: any;
  private isActive: boolean = false;
  private isRedirecting: boolean = false;

  constructor(private container: IContainer) {
    this.historyBrowser = new HistoryBrowser();
  }

  public activate(options?: Object): void {
    if (this.isActive) {
      throw new Error('Router has already been activated.');
    }

    this.isActive = true;
    this.options = Object.assign({}, {
      callback: (navigationInstruction) => {
        this.historyCallback(navigationInstruction);
      }
    }, options);

    this.historyBrowser.activate(this.options);
  }

  public historyCallback(instruction: INavigationInstruction): Promise<void> {
    if (this.options.reportCallback) {
      this.options.reportCallback(instruction);
    }

    if (instruction.isCancel) {
      return;
    }

    let route: IRoute = this.findRoute(instruction);
    if (!route) {
      return;
    }

    if (route.redirect) {
      route = this.resolveRedirect(route, instruction.data);
      this.isRedirecting = true;
      this.historyBrowser.redirect(route.path, route.title, instruction.data);
      return;
    }

    if (route.title) {
      this.historyBrowser.setEntryTitle(route.title);
    }

    const viewports: Viewport[] = [];
    for (const vp in route.viewports) {
      const routeViewport: IRouteViewport = route.viewports[vp];
      const viewport = this.findViewport(vp);
      if (viewport.setNextContent(routeViewport.component, instruction)) {
        viewports.push(viewport);
      }
    }

    // We've gone via a redirected route back to same viewport status so
    // we need to remove the added history entry for the redirect
    if (!viewports.length && this.isRedirecting) {
      this.historyBrowser.cancel();
      this.isRedirecting = false;
    }

    let cancel: boolean = false;
    return Promise.all(viewports.map((value) => value.canLeave()))
      .then((promises: boolean[]) => {
        if (cancel || promises.findIndex((value) => value === false) >= 0) {
          cancel = true;
          return Promise.resolve([]);
        } else {
          return Promise.all(viewports.map((value) => value.canEnter()));
        }
      }).then((promises: boolean[]) => {
        if (cancel || promises.findIndex((value) => value === false) >= 0) {
          cancel = true;
          return Promise.resolve([]);
        } else {
          return Promise.all(viewports.map((value) => value.loadContent()));
        }
      }).then(() => {
        if (cancel) {
          this.historyBrowser.cancel();
        }
      });
  }

  public findRoute(entry: IHistoryEntry): IRoute {
    return this.routes.find((value) => value.path === entry.path);
  }
  public resolveRedirect(route: IRoute, data?: Object): IRoute {
    while (route.redirect) {
      const redirectRoute: IRoute = this.findRoute({
        path: route.redirect,
        data: data,
      });
      if (redirectRoute) {
        route = redirectRoute;
      } else {
        break;
      }
    }
    return route;
  }

  public findViewport(name: string): Viewport {
    return this.viewports[name] || this.addViewport(name, null, null);
  }

  public renderViewports(viewports: Viewport[]): void {
    for (const viewport of viewports.filter((value) => value.nextContent)) {
      viewport.loadContent();
    }
  }

  public renderViewport(viewport: Viewport): Promise<any> {
    return viewport.canEnter().then(() => viewport.loadContent());
  }

  public addViewport(name: string, element: Element, controller: any): Viewport {
    const viewport = this.viewports[name];
    if (!viewport) {
      return this.viewports[name] = new Viewport(this.container, name, element, controller);
    }
    if (element) {
      setTimeout(() => {
        viewport.element = element;
        viewport.controller = controller;
        this.renderViewport(viewport);
      }, 0);
    }
    return viewport;
  }

  public addRoute(route: IRoute): void {
    this.routes.push(route);
  }

  public goto(path: string, title?: string, data?: Object): void {
    this.historyBrowser.goto(path, title, data);
  }

  public replace(path: string, title?: string, data?: Object): void {
    this.historyBrowser.replace(path, title, data);
  }

  public refresh(): void {
    this.historyBrowser.refresh();
  }

  public back(): void {
    this.historyBrowser.back();
  }

  public forward(): void {
    this.historyBrowser.forward();
  }
}
