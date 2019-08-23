import { ICustomElementType } from '@aurelia/runtime';

import { Guard } from './guard';
import { INavigatorInstruction } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IGuardTarget {
  component?: Partial<ICustomElementType>;
  componentName?: string;
  viewport?: Viewport;
  viewportName?: string;
}

// Only one so far, but it's easier to support more from the start
export const enum GuardTypes {
  Before = 'before',
}

export type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigatorInstruction) => boolean | ViewportInstruction[];
export type GuardTarget = IGuardTarget | Partial<ICustomElementType> | string;
export type GuardIdentity = number;

export interface IGuardOptions {
  type?: GuardTypes;
  include?: GuardTarget[];
  exclude?: GuardTarget[];
}

export class Guardian {
  public guards: Record<GuardTypes, Guard[]>;

  private lastIdentity: number;

  constructor() {
    this.guards = { before: [] };
    this.lastIdentity = 0;
  }

  public addGuard(guardFunction: GuardFunction, options?: IGuardOptions): GuardIdentity {
    const guard = new Guard(guardFunction, options || {}, ++this.lastIdentity);

    this.guards[guard.type].push(guard);

    return this.lastIdentity;
  }

  public removeGuard(id: GuardIdentity): Guard {
    for (const type in this.guards) {
      const index = this.guards[type].findIndex(guard => guard.id === id);
      if (index > -1) {
        return this.guards[type].splice(index, 1);
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
