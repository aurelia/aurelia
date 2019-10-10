import { Guard } from './guard';
import { GuardFunction, GuardTarget, INavigatorInstruction } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';

// Only one so far, but it's easier to support more from the start
export const enum GuardTypes {
  Before = 'before',
}

export type GuardIdentity = number;

export interface IGuardOptions {
  /**
   * What event/when to guard. Defaults to Before
   */
  type?: GuardTypes;
  /**
   * What to guard. If omitted, everything is included
   */
  include?: GuardTarget[];
  /**
   * What not to guard. If omitted, nothing is excluded
   */
  exclude?: GuardTarget[];
}

export class Guardian {
  public guards: Record<GuardTypes, Guard[]> = { before: [] };

  private lastIdentity: number = 0;

  public addGuard(guardFunction: GuardFunction, options?: IGuardOptions): GuardIdentity {
    const guard = new Guard(guardFunction, options || {}, ++this.lastIdentity);

    this.guards[guard.type].push(guard);

    return this.lastIdentity;
  }

  public removeGuard(id: GuardIdentity): void {
    for (const type in this.guards) {
      const index = this.guards[type as GuardTypes].findIndex(guard => guard.id === id);
      if (index > -1) {
        this.guards[type as GuardTypes].splice(index, 1);
      }
    }
  }

  public passes(type: GuardTypes, viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction): boolean | ViewportInstruction[] {
    let modified: boolean = false;
    for (const guard of this.guards[type]) {
      if (guard.matches(viewportInstructions)) {
        const outcome = guard.check(viewportInstructions, navigationInstruction);
        if (typeof outcome === 'boolean') {
          if (!outcome) {
            return false;
          }
        } else {
          viewportInstructions = outcome;
          modified = true;
        }
      }
    }
    return modified ? viewportInstructions : true;
  }
}
