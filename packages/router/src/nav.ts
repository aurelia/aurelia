import { ICustomElementType } from '@aurelia/runtime';
import { NavRoute } from './nav-route';
import { INavClasses } from './resources/nav';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';

export interface IViewportComponent {
  component: string | Partial<ICustomElementType>;
  viewport?: string;
  parameters?: Record<string, unknown> | string;
}

export type NavInstruction = string | Partial<ICustomElementType> | IViewportComponent | ViewportInstruction;

export interface INavRoute {
  route?: NavInstruction | NavInstruction[];
  execute?: ((route: NavRoute) => void);
  condition?: boolean | ((route: NavRoute) => boolean);
  consideredActive?: NavInstruction | NavInstruction[] | ((route: NavRoute) => boolean);
  compareParameters?: boolean;
  link?: string;
  title: string;
  children?: INavRoute[];
  meta?: Record<string, unknown>;
}

export class Nav {
  public name: string;
  public routes: NavRoute[];
  public classes: INavClasses;

  public router: IRouter;

  constructor(router: IRouter, name: string, routes: NavRoute[] = [], classes: INavClasses = {}) {
    this.router = router;
    this.name = name;
    this.routes = routes;
    this.classes = classes;
    this.update();
  }

  public addRoutes(routes: INavRoute[]): void {
    for (const route of routes) {
      this.addRoute(this.routes, route);
    }
    this.update();
  }

  public update(): void {
    this.updateRoutes(this.routes);
    this.routes = this.routes.slice();
  }

  private addRoute(routes: NavRoute[], route: INavRoute): void {
    const newRoute = new NavRoute(this, route);
    routes.push(newRoute);
    if (route.children) {
      newRoute.children = [];
      for (const child of route.children) {
        this.addRoute(newRoute.children, child);
      }
    }
  }

  private updateRoutes(routes: NavRoute[]): void {
    for (const route of routes) {
      route.update();
      if (route.children && route.children.length) {
        this.updateRoutes(route.children);
      }
    }
  }
}
