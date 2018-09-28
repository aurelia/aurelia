import { IContainer, Reporter, Immutable } from '@aurelia/kernel';
import { IPipelineBehavior, PipelineBehavior } from './pipeline-behavior';
import { DI, IIndexable, inject } from '@aurelia/kernel';
import { IHistory } from './history';
import { ILocation } from './location';
import { IRoute, IActivatableType, IActivatable, RouteResource, RouteFlags } from './route';
import { RouterView } from './router-view';

// tslint:disable:no-reserved-keywords

export interface IRouter extends IHistory, ILocation {
  addRoute(route: Required<Immutable<IRoute>>): void;
  removeRoute(route: Required<Immutable<IRoute>>): void;
  addRouterView(routerView: RouterView): void;
  removeRouterView(routerView: RouterView): void;
  applyPipelineBehavior(type: IActivatableType, instance: IActivatable): void;
}

export const IRouter = DI.createInterface<IRouter>().withDefault(x => x.singleton(Router));

@inject(IHistory, ILocation, IContainer)
export class Router implements IRouter {
  private routerViews: RouterView[];
  private routes: Required<Immutable<IRoute>>[];
  private behaviorLookup = new Map<IActivatableType, PipelineBehavior>();

  constructor(
    private history: IHistory,
    private location: ILocation,
    private container: IContainer
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
  public addRoute(route: Required<Immutable<IRoute>>): void {
    const i = this.routes.indexOf(route);
    if (i === -1) {
      this.routes.push(route);
    }
  }
  public removeRoute(route: Required<Immutable<IRoute>>): void {
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
  public activate(route: Required<Immutable<IRoute>>): void {
    const activatable = this.container.get<IActivatable>(RouteResource.keyFrom(route.name));
    const routerView = this.routerViews.find(r => r.name === route.viewport);
    const context = {
      target: route.target,
      router: this,
      routerView,
      route
    };
    const flags = RouteFlags.fromActivate;
    activatable.$configureRoute(<any>context, flags);
    activatable.$activate(<any>context, flags);
  }
  public findMatchingRoute(url: string): Required<Immutable<IRoute>> | null {
    const routes = this.routes;
    for (let i = 0, ii = routes.length; i < ii; ++i) {
      const route = routes[i];
      const paths = route.path;
      for (let j = 0, jj = paths.length; j < jj; ++j) {
        const path = paths[j];
        // veeeery simple/naive matcher just to get things working
        if (path.includes(url) || url.includes(path)) {
          return route;
        }
      }
    }
    throw Reporter.error(480);
  }

  public applyPipelineBehavior(type: IActivatableType, instance: IActivatable): void {
    let found = this.behaviorLookup.get(type);

    if (!found) {
      found = PipelineBehavior.create(type, instance);
      this.behaviorLookup.set(type, found);
    }

    found.applyTo(instance);
  }
}
