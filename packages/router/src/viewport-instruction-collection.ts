/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { IScopeOwner } from './routing-scope.js';
import { arrayRemove } from './utils.js';

/**
 * @internal - Shouldn't be used directly
 */
export class RoutingInstructionCollection extends Array<RoutingInstruction> {
  public get empty(): boolean {
    return this.length === 0;
  }

  public get first(): RoutingInstruction {
    return this[0];
  }

  public getDefaults(): RoutingInstructionCollection {
    return new RoutingInstructionCollection(...this.filter(instruction => instruction.default));
  }
  public getNonDefaults(): RoutingInstructionCollection {
    return new RoutingInstructionCollection(...this.filter(instruction => !instruction.default));
  }

  public getScopeOwners(configuredRoutePath: string | null): IScopeOwner[] {
    return this
      .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
      .map(instr => instr.owner)
      .filter((value, index, arr) => arr.indexOf(value) === index) as IScopeOwner[];
  }

  public remove(instruction: RoutingInstruction): void {
    arrayRemove(this, value => value === instruction);
  }
}
