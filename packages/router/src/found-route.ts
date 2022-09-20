/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { Route } from './route';
import { RoutingInstruction } from './instructions/routing-instruction';

/**
 * Used when founding route/instructions
 *
 * @internal
 */
export class FoundRoute {
  public constructor(
    public match: Route | null = null,
    public matching: string = '',
    public instructions: RoutingInstruction[] = [],
    public remaining: string = '',
    // public remaining: string | null = null,
    public params: Record<string, unknown> = {},
  ) { }

  public get foundConfiguration(): boolean {
    return this.match !== null;
  }
  public get foundInstructions(): boolean {
    return this.instructions.some(instruction => !instruction.component.none);
  }
  public get hasRemaining(): boolean {
    return this.instructions.some(instruction => instruction.hasNextScopeInstructions);
  }
}
