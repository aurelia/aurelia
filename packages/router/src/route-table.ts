import { IRouter, IRouteTransformer } from './router';
import { ViewportInstruction } from './viewport-instruction';
import { IRoute, IFoundRoute } from './interfaces';
import { NavigationInstructionResolver } from './type-resolvers';

/**
 * Class that handles routes configured in a route table
 */
export class RouteTable implements IRouteTransformer {
  public routes: IRoute[] = [];

  /**
   * Check a route against the route table and return the appropriate viewport instructions.
   *
   * @param route - The route to match.
   * @param router - The application router.
   * @returns The viewport instructions for a found route or the route if not found.
   */
  public transformFromUrl = (route: string, router: IRouter): string | ViewportInstruction[] => {
    // TODO: Implement route recognizing to transform a configured route to a set of viewport instructions
    return route;
  };

  /**
   * Find the route in the route table for a set of viewport instructions.
   *
   * @param instructions - The set of viewport instructions to match.
   * @param router - The application router.
   * @returns The route for a found set of viewport instructions or the viewport instructions if not found.
   */
  public transformToUrl = (instructions: ViewportInstruction[], router: IRouter): string | ViewportInstruction[] => {
    // TODO: Implement mapping from set of viewport instructions to a configured route
    return instructions;
  };

  // TODO: Best solution is probably to have routes owned
  // by viewports and then pass stripped child routes to
  // all viewports within a route
  public addRoutes(router: IRouter, routes: IRoute[], parent?: string): IRoute[] {
    if (parent !== void 0 && parent.length > 0 && !parent.endsWith('/')) {
      parent += '/';
    }
    this.routes.unshift(...routes.map(route => this.ensureProperRoute(router, route, parent)));
    return routes;
  }
  public removeRoutes(router: IRouter, routes: IRoute[] | string[]): void {
    for (const route of routes) {
      const id = typeof route === 'string' ? route : this.ensureProperRoute(router, route).id;
      const index = this.routes.findIndex(item => item.id === id);
      if (index > -1) {
        this.routes.splice(index, 1);
      }
    }
  }

  public findMatchingRoute(router: IRouter, path: string): IFoundRoute {
    let match: IRoute | null = null;
    let matching: string = '';
    let params: Record<string, string> = {};
    if (path.startsWith('/') || path.startsWith('+')) {
      path = path.slice(1);
    }
    for (const route of this.routes) {
      const find = '^' + route.path.replace('+', '\\+').replace(/\:id/g, '(\\d+)');
      const regex = new RegExp(find);
      const found = regex.exec(path);
      if (found !== null && (match === null || route.path.length > match.path.length)) {
        match = route;
        matching = found[0];
        if (found.length > 1) {
          params.id = found[1];
        }
      }
    }
    if (match !== null) {
      // Clone it so it config doesn't get modified
      match = { ...match };
      match.instructions = router.instructionResolver.cloneViewportInstructions(match.instructions as ViewportInstruction[]);
      for (const instruction of match.instructions as ViewportInstruction[]) {
        instruction.setParameters(params);
      }
    }
    return { match, matching, remaining: path.slice(matching.length) };
  }

  private ensureProperRoute(router: IRouter, route: IRoute, parent?: string): IRoute {
    if (parent !== void 0 && parent.length && !route.path.startsWith('/')) {
      route.path = parent + route.path;
    }
    if (route.id === void 0) {
      route.id = route.path;
    }
    route.instructions = NavigationInstructionResolver.toViewportInstructions(router, route.instructions);
    return route;
  }
}
