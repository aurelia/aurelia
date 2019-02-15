import { ICustomElementType } from '@aurelia/runtime';
import { NavRoute } from './nav-route';
import { Router } from './router';
import { ViewportInstruction } from './viewport-instruction';

export interface IViewportComponent {
  component: string | Partial<ICustomElementType>;
  viewport?: string;
  parameters?: Record<string, unknown> | string;
}

export type NavInstruction = string | Partial<ICustomElementType> | IViewportComponent | ViewportInstruction;

export interface INavRoute {
  route: NavInstruction | NavInstruction[];
  consideredActive?: NavInstruction | NavInstruction[];
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
