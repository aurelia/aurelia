import { IContainer, inject } from '@aurelia/kernel';
import { HistoryBrowser, IHistoryEntry, INavigationInstruction } from './history-browser';
import { Viewport } from './viewport';

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

    const route: IRoute = this.findRoute(instruction);
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
      if (viewport.setNextContent(routeViewport.component, instruction)) {
        viewports.push(viewport);
      }
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

  public goto(path: string, title?: string, data?: Object): void {
    this.historyBrowser.goto(path, title, data);
  }

  public replace(path: string, title?: string, data?: Object): void {
    this.historyBrowser.goto(path, title, data);
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
