// NOTE: this file is currently not in use

import { ICustomElementType } from '@aurelia/runtime';
import { NavComponent, NavRoute } from './nav-route';
import { Router } from './router';

export interface INavRoute {
  components: string | ICustomElementType | Record<string, unknown>;
  consideredActive?: NavComponent;
  link?: string;
  title: string;
  children?: INavRoute[];
  meta?: Record<string, unknown>;
}

export class Nav {
  public name: string;
  public routes: NavRoute[];

  public router: Router;

  constructor(router: Router, name: string) {
    this.router = router;
    this.name = name;

    this.routes = [];
  }

  public addRoutes(routes: INavRoute[]): void {
    for (const route of routes) {
      this.addRoute(this.routes, route);
    }
  }

  public addRoute(routes: NavRoute[], route: INavRoute): void {
    const newRoute = new NavRoute(this, route);
    routes.push(newRoute);
    if (route.children) {
      newRoute.children = [];
      for (const child of route.children) {
        this.addRoute(newRoute.children, child);
      }
    }
  }
}
