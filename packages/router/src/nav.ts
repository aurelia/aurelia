// NOTE: this file is currently not in use

import { CustomElementResource, ICustomElementType } from '@aurelia/runtime';
import { NavRoute } from './nav-route';
import { Router } from './router';

export interface INavRoute {
  components: string | ICustomElementType | Object;
  consideredActive?: string | ICustomElementType | Object;
  link?: string;
  title: string;
  children?: INavRoute[];
  meta?: Object;
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
