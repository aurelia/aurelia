import { IContainer, inject } from '@aurelia/kernel';
import { Aurelia, CustomElementResource, ICustomElement, ICustomElementType } from '@aurelia/runtime';
import { HistoryBrowser, IHistoryEntry, INavigationInstruction } from './history-browser';
import { Scope } from './scope';
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
  component: ICustomElementType | string;
}

@inject(IContainer)
export class Router {
  public routes: IRoute[] = [];
  public viewports: Object = {};

  public rootScope: Scope;
  public scopes: Scope[] = [];

  public historyBrowser: HistoryBrowser;

  private options: any;
  private isActive: boolean = false;
  private isRedirecting: boolean = false;

  constructor(public container: IContainer) {
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

    let title;
    let views: any;
    let route: IRoute = this.findRoute(instruction);
    if (route) {
      if (route.redirect) {
        route = this.resolveRedirect(route, instruction.data);
        this.isRedirecting = true;
        this.historyBrowser.redirect(route.path, route.title, instruction.data);
        return;
      }

      if (route.title) {
        title = route.title;
      }

      views = route.viewports;
    } else {
      views = this.findViews(instruction);
    }

    if (!views && !Object.keys(views).length) {
      return;
    }

    if (title) {
      this.historyBrowser.setEntryTitle(title);
    }

    const viewports: Viewport[] = [];
    for (let vp in views) {
      let component: ICustomElementType | string = views[vp];
      const viewport = this.findViewport(`${vp}:${component}`);
      if (viewport.setNextContent(component, instruction)) {
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
          return Promise.all(viewports.map((value) =>
            value.loadContent()));
        }
      }).then(() => {
        if (cancel) {
          this.historyBrowser.cancel();
        }
        console.log('=========== ROUTER', this);
      }).then(() => {
        // TODO: Eliminate duplications
        const viewports = this.rootScope.viewportStates();
        this.historyBrowser.replacePath(viewports.join('/'));
      });
  }

  // public view(views: Object, title?: string, data?: Object): Promise<void> {
  //   console.log('Router.view:', views, title, data);

  //   if (title) {
  //     this.historyBrowser.setEntryTitle(title);
  //   }

  //   const viewports: Viewport[] = [];
  //   for (const v in views) {
  //     const component: ICustomElementType = views[v];
  //     const viewport = this.findViewport(`${v}:${component}`);
  //     if (viewport.setNextContent(component, { path: '' })) {
  //       viewports.push(viewport);
  //     }
  //   }

  //   // We've gone via a redirected route back to same viewport status so
  //   // we need to remove the added history entry for the redirect
  //   if (!viewports.length && this.isRedirecting) {
  //     this.historyBrowser.cancel();
  //     this.isRedirecting = false;
  //   }

  //   let cancel: boolean = false;
  //   return Promise.all(viewports.map((value) => value.canLeave()))
  //     .then((promises: boolean[]) => {
  //       if (cancel || promises.findIndex((value) => value === false) >= 0) {
  //         cancel = true;
  //         return Promise.resolve([]);
  //       } else {
  //         return Promise.all(viewports.map((value) => value.canEnter()));
  //       }
  //     }).then((promises: boolean[]) => {
  //       if (cancel || promises.findIndex((value) => value === false) >= 0) {
  //         cancel = true;
  //         return Promise.resolve([]);
  //       } else {
  //         return Promise.all(viewports.map((value) => value.loadContent()));
  //       }
  //     }).then(() => {
  //       if (cancel) {
  //         this.historyBrowser.cancel();
  //       }
  //     }).then(() => {
  //       const viewports = Object.values(this.viewports).map((value) => value.description()).filter((value) => value && value.length);
  //       this.historyBrowser.history.replaceState({}, null, '#/' + viewports.join('/'));
  //     });
  // }

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

  public findViews(entry: IHistoryEntry): Object {
    const views: Object = {};
    let sections: string[] = entry.path.split('/');
    if (sections.length && sections[0] === '') {
      sections.shift();
    }

    // Expand with instances for all containing views
    const expandedSections: string[] = [];
    while (sections.length) {
      const part = sections.shift();
      const parts = part.split('+');
      for (let i = 1; i <= parts.length; i++) {
        expandedSections.push(parts.slice(0, i).join('+'));
      }
    }
    sections = expandedSections;

    let index = 0;
    while (sections.length) {
      const view = sections.shift();
      // TODO: implement parameters
      // As a = part at the end of the view!
      const parts = view.split(':');
      const component = parts.pop();
      const name = (parts.length ? parts.join(':') : `?${index++}`);
      if (component) {
        views[name] = component;
      }
    }
    return views;
  }

  public findViewport(name: string): Viewport {
    return this.rootScope.findViewport(name);
  }

  public findScope(element: Element): Scope {
    if (!this.rootScope) {
      const aureliaRootElement = this.container.get(Aurelia).root().$host;
      this.rootScope = new Scope(this, <Element>aureliaRootElement, null);
      this.scopes.push(this.rootScope);
    }
    return this.closestScope(element);
  }

  // Called from the viewport custom element
  public addViewport(name: string, element: Element, newScope?: boolean): Viewport {
    const parentScope = this.findScope(element);
    return parentScope.addViewport(name, element, newScope);
  }
  // Called from the viewport custom element
  public removeViewport(viewport: Viewport): void {
    // TODO: There's something hinky with remove!
    const scope = viewport.owningScope;
    if (!scope.removeViewport(viewport)) {
      this.removeScope(scope);
    }
  }

  public removeScope(scope: Scope): void {
    if (scope !== this.rootScope) {
      scope.removeScope();
      const index = this.scopes.indexOf(scope);
      if (index >= 0) {
        this.scopes.splice(index, 1);
      }
    }
  }

  public addRoute(route: IRoute): void {
    this.routes.push(route);
  }

  public goto(pathOrViewports: string | Object, title?: string, data?: Object): void {
    if (typeof pathOrViewports === 'string') {
      this.historyBrowser.goto(pathOrViewports, title, data);
    }
    // else {
    //   this.view(pathOrViewports, title, data);
    // }
  }

  public replace(pathOrViewports: string | Object, title?: string, data?: Object): void {
    if (typeof pathOrViewports === 'string') {
      this.historyBrowser.replace(pathOrViewports, title, data);
    }
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

  private closestScope(element: Element): Scope {
    let closest: number = Number.MAX_SAFE_INTEGER;
    let scope: Scope;
    for (const sc of this.scopes) {
      let el = element;
      let i = 0;
      while (el) {
        if (el === sc.element) {
          break;
        }
        i++;
        el = el.parentElement;
      }
      if (i < closest) {
        closest = i;
        scope = sc;
      }
    }
    return scope;
  }
}
