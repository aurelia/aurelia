import { IRoute } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
import { INode } from '@aurelia/runtime';

export class FoundRoute<T extends INode> {
  public constructor(
    public match: IRoute<T> | null = null,
    public matching: string = '',
    public instructions: ViewportInstruction<T>[] = [],
    public remaining: string = '',
  ) { }

  public get foundConfiguration(): boolean {
    return this.match !== null;
  }
  public get foundInstructions(): boolean {
    return this.instructions.length > 0;
  }
  public get hasRemaining(): boolean {
    return this.remaining !== null && this.remaining.length > 0;
  }
}
