import { IContainer, inject } from '@aurelia/kernel';
import { HistoryBrowser, IHistoryEntry, INavigationInstruction } from './history-browser';
import { Viewport } from './viewport';
import { ICustomElement, CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { Scope } from './scope';

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
      if (vp.substring(0, 1) === '+') {
        component = this.resolveComponent(component);
        if ((<any>component).viewport) {
          vp = (<any>component).viewport;
        }
      }
      const viewport = this.findViewport(vp);
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
          return Promise.all(viewports.map((value) => value.loadContent()));
        }
      }).then(() => {
        if (cancel) {
          this.historyBrowser.cancel();
        }
      });
  }

  public view(views: Object, title?: string, data?: Object): Promise<void> {
    console.log('Router.view:', views, title, data);

    if (title) {
      this.historyBrowser.setEntryTitle(title);
    }

    const viewports: Viewport[] = [];
    for (const v in views) {
      const component: ICustomElementType = views[v];
      const viewport = this.findViewport(v);
      if (viewport.setNextContent(component, { path: '' })) {
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
      }).then(() => {
        const viewports = Object.values(this.viewports).map((value) => value.description()).filter((value) => value && value.length);
        this.historyBrowser.history.replaceState({}, null, '#/' + viewports.join('/'));
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

  public findViews(entry: IHistoryEntry): Object {
    const views: Object = {};
    const sections = entry.path.split('/');
    if (sections.length && sections[0] === '') {
      sections.shift();
    }
    let index = 0;
    while (sections.length) {
      const view = sections.shift();
      // TODO: implement parameters
      // const data = sections.shift();
      const parts = view.split(':');
      const component = parts.pop();
      const name = parts.pop() || `+${index++}`;
      if (component) {
        views[name] = component;
      }
    }
    return views;
  }

  public findViewport(name: string): Viewport {
    return this.viewports[name] || this.addViewport(name, null);
  }

  public findScope(element: Element, newScope: boolean): Scope {
    if (!this.rootScope) {
      this.rootScope = new Scope(this.container, element, null);
      this.scopes.push(this.rootScope);
      return this.rootScope;
    }
    let scope: Scope = this.closestScope(element);
    if (newScope) {
      scope = new Scope(this.container, element, scope);
      this.scopes.push(scope);
      return scope;
    }
    return scope;
  }

  public addViewport(name: string, element: Element, scope?: boolean): Viewport {
    return this.findScope(element, scope).addViewport(name, element);
  }
  public removeViewport(viewport: Viewport): void {
    const scope = viewport.scope;
    if (!scope.removeViewport(viewport)) {
      this.scopes.splice(this.scopes.indexOf(scope), 1);
      if (scope === this.rootScope) {
        this.rootScope = null;
      }
    }
  }

  public addRoute(route: IRoute): void {
    this.routes.push(route);
  }

  public goto(pathOrViewports: string | Object, title?: string, data?: Object): void {
    if (typeof pathOrViewports === 'string') {
      this.historyBrowser.goto(pathOrViewports, title, data);
    } else {
      this.view(pathOrViewports, title, data);
    }
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
      let el = sc.element;
      let i = 0;
      while (el) {
        if (el === element) {
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

  private resolveComponent(component: ICustomElementType | string): ICustomElementType {
    if (typeof component === 'string') {
      const resolver = this.container.getResolver(CustomElementResource.keyFrom(component));
      if (resolver !== null) {
        component = <ICustomElementType>resolver.getFactory(this.container).Type;
      }
    }
    return <ICustomElementType>component;
  }
}
