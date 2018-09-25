import { DI, IIndexable, inject } from '@aurelia/kernel';
import { IHistory } from './history';
import { ILocation } from './location';
import { IRoute } from './route';
import { RouterView } from './router-view';

export interface IRouter extends IHistory, ILocation {
  addRoute(route: IRoute): void;
  removeRoute(route: IRoute): void;
  addRouterView(routerView: RouterView): void;
  removeRouterView(routerView: RouterView): void;
}

export const IRouter = DI.createInterface<IRouter>().withDefault(x => x.singleton(Router));

@inject(IHistory, ILocation)
export class Router implements IRouter {
  private routerViews: RouterView[];
  private routes: IRoute[];

  constructor(
    private history: IHistory,
    private location: ILocation
  ) {
    this.routerViews = [];
    this.routes = [];
  }

  public back(): void {
    this.history.back();
  }
  public forward(): void {
    this.history.forward();
  }
  public go(delta?: number): void {
    this.history.go(delta);
  }
  public pushState(data: IIndexable, title?: string, url?: string | null): void {
    this.activate(this.findMatchingRoute(url));
    this.history.pushState(data, title, url);
  }
  public replaceState(data: IIndexable, title?: string, url?: string | null): void {
    this.activate(this.findMatchingRoute(url));
    this.history.replaceState(data, title, url);
  }
  public assign(url: string): void {
    this.activate(this.findMatchingRoute(url));
    this.location.assign(url);
  }
  public replace(url: string): void {
    this.activate(this.findMatchingRoute(url));
    this.location.replace(url);
  }
  public reload(): void {
    this.location.reload();
  }
  public addRoute(route: IRoute): void {
    const i = this.routes.indexOf(route);
    if (i === -1) {
      this.routes.push(route);
    }
  }
  public removeRoute(route: IRoute): void {
    const i = this.routes.indexOf(route);
    if (i !== -1) {
      this.routes.splice(i, 1);
    }
  }
  public addRouterView(routerView: RouterView): void {
    const i = this.routerViews.indexOf(routerView);
    if (i === -1) {
      this.routerViews.push(routerView);
    }
  }
  public removeRouterView(routerView: RouterView): void {
    const i = this.routerViews.indexOf(routerView);
    if (i !== -1) {
      this.routerViews.splice(i, 1);
    }
  }
  public activate(route: IRoute): void {
    const routerView = this.routerViews.find(r => r.name === route.name);
    routerView.target = route.target;
  }
  public findMatchingRoute(url: string): IRoute | null {
    return this.routes.find(r => (<string>r.path).includes(url) || url.includes((<string>r.path)));
  }
}
