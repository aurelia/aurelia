import { ViewportInstruction } from './viewport-instruction';
import { IScopeOwner } from './scope';
import { arrayRemove } from './utils';
import { INode } from '@aurelia/runtime';

export class ViewportInstructionCollection<T extends INode> extends Array<ViewportInstruction<T>> {
  public get empty(): boolean {
    return this.length === 0;
  }

  public get first(): ViewportInstruction<T> {
    return this[0];
  }

  public getDefaults(): ViewportInstructionCollection<T> {
    return new ViewportInstructionCollection(...this.filter(instruction => instruction.default));
  }
  public getNonDefaults(): ViewportInstructionCollection<T> {
    return new ViewportInstructionCollection(...this.filter(instruction => !instruction.default));
  }

  public getScopeOwners(configuredRoutePath: string | null): IScopeOwner<T>[] {
    return this
      .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
      .map(instr => instr.owner)
      .filter((value, index, arr) => arr.indexOf(value) === index) as IScopeOwner<T>[];
  }

  public remove(instruction: ViewportInstruction<T>): void {
    arrayRemove(this, value => value === instruction);
  }
}
