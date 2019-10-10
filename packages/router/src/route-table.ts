import { IRouter, IRouteTransformer } from './router';
import { ViewportInstruction } from './viewport-instruction';

/**
 * Class that handles routes configured in a route table
 */
export class RouteTable implements IRouteTransformer {

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
}
