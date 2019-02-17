import { Router } from './router';
import { ViewportInstruction } from './viewport-instruction';

/**
 * Class that handles routes configured in a route table
 */
export class RouteTable {

  /**
   * Check a route against the route table and return the appropriate viewport instructions.
   *
   * @param route The route to match.
   * @param router The application router.
   * @returns The viewport instructions for a found route or the route if not found.
   */
  public transformFromUrl = (route: string, router: Router): string | ViewportInstruction[] => {
    if (route === 'welcome' || route === '/welcome') {
      return [new ViewportInstruction('books'), new ViewportInstruction('about')];
    }
    return route;
  }

  /**
   * Find the route in the route table for a set of viewport instructions.
   *
   * @param instructions The set of viewport instructions to match.
   * @param router The application router.
   * @returns The route for a found set of viewport instructions or the viewport instructions if not found.
   */
  public transformToUrl = (instructions: ViewportInstruction[], router: Router): string | ViewportInstruction[] => {
    const components = router.instructionResolver.viewportInstructionsFromString('books+about');
    if (this.matchViewportInstructions(instructions, components)) {
      return 'welcome';
    }
    return instructions;
  }

  // Check if instruction sets match. NOT COMPLETE CODE: it should also check viewport
  // and, possibly, parameters (or their configuration)
  private matchViewportInstructions(instructionsA: ViewportInstruction[], instructionsB: ViewportInstruction[]): boolean {
    for (const instruction of instructionsA) {
      if (!instructionsB.find((i) => i.sameComponent(instruction))) {
        return false;
      }
    }
    for (const instruction of instructionsB) {
      if (!instructionsA.find((i) => i.sameComponent(instruction))) {
        return false;
      }
    }
    return true;
  }
}
