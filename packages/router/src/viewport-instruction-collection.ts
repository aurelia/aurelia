import { ViewportInstruction } from './viewport-instruction';
import { IScopeOwner } from './scope';
import { arrayRemove } from './utils';

export class ViewportInstructionCollection extends Array<ViewportInstruction> {
  public get empty(): boolean {
    return this.length === 0;
  }

  public get first(): ViewportInstruction {
    return this[0];
  }

  public getDefaults(): ViewportInstructionCollection {
    return new ViewportInstructionCollection(...this.filter(instruction => instruction.default));
  }
  public getNonDefaults(): ViewportInstructionCollection {
    return new ViewportInstructionCollection(...this.filter(instruction => !instruction.default));
  }

  public getScopeOwners(configuredRoutePath: string | null): IScopeOwner[] {
    return this
      .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
      .map(instr => instr.owner)
      .filter((value, index, arr) => arr.indexOf(value) === index) as IScopeOwner[];
  }

  public remove(instruction: ViewportInstruction): void {
    arrayRemove(this, value => value === instruction);
  }
}
