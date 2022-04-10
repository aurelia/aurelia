/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { LoadInstruction } from './interfaces.js';
import { NavRoute } from './nav-route.js';
import { INavClasses } from './resources/nav.js';
import { IRouter } from './router.js';

/**
 * Public API - Used by au-nav and Router add/setNav
 */
export interface INavRoute {
  route?: LoadInstruction | LoadInstruction[];
  execute?: ((route: NavRoute) => void);
  condition?: boolean | ((route: NavRoute) => boolean);
  consideredActive?: LoadInstruction | LoadInstruction[] | ((route: NavRoute) => boolean);
  compareParameters?: boolean;
  link?: string;
  title: string;
  children?: INavRoute[];
  meta?: Record<string, unknown>;
}

/**
 * Public API - Used by au-nav and Router add/setNav
 */
export class Nav {

  public static navs: Map<string, Nav> = new Map();

  public constructor(
    public router: IRouter,
    public name: string,
    public routes: NavRoute[] = [],
    public classes: INavClasses = {}
  ) {
    this.update();
  }

  /**
   * Public API
   */
  public static setNav(router: IRouter, name: string, routes: INavRoute[], classes?: INavClasses): void {
    const nav = this.findNav(name);
    if (nav !== void 0 && nav !== null) {
      nav.routes = [];
    }
    this.addNav(router, name, routes, classes);
  }
  /**
   * Public API
   */
  public static addNav(router: IRouter, name: string, routes: INavRoute[], classes?: INavClasses): void {
    let nav = Nav.navs.get(name);
    if (nav == null) {
      Nav.navs.set(name, new Nav(router, name, [], classes));
      nav = Nav.navs.get(name);
    }
    nav!.addRoutes(routes);
    nav!.update();
  }
  /**
   * Public API
   */
  public static updateNav(name?: string): void {
    const navs = name
      ? [name]
      : Object.keys(this.navs);
    for (const nav of navs) {
      if (Nav.navs.has(nav)) {
        Nav.navs.get(nav)!.update();
      }
    }
  }
  /**
   * Public API
   */
  public static findNav(name: string): Nav | void{
    return Nav.navs.get(name);
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
