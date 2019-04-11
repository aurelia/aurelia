import { ICustomElementType } from '@aurelia/runtime';

import { INavigationInstruction } from './history-browser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export interface IGuardTarget {
  component?: Partial<ICustomElementType>;
  componentName?: string;
  viewport?: Viewport;
  viewportName?: string;
}

export class Target {
  public component?: Partial<ICustomElementType>;
  public componentName?: string;
  public viewport?: Viewport;
  public viewportName?: string;

  constructor(target: GuardTarget) {
    const { component, componentName, viewport, viewportName } = target as IGuardTarget;
    if (typeof target === 'string') {
      this.componentName = target;
    } else if (component || componentName || viewport || viewportName) {
      this.component = component;
      this.componentName = componentName;
      this.viewport = viewport;
      this.viewportName = viewportName;
    } else {
      this.component = target as Partial<ICustomElementType>;
    }
  }

  public matches(viewportInstructions: ViewportInstruction[]): boolean {
    for (const instruction of viewportInstructions) {
      if (this.componentName === instruction.componentName ||
        this.component === instruction.component ||
        this.viewportName === instruction.viewportName ||
        this.viewport === instruction.viewport) {
        return true;
      }
    }
    return false;
  }
}

// Only one so far, but it's easier to support more from the start
export const enum GuardTypes {
  Before = 'before',
}

export type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigationInstruction) => boolean;
export type GuardTarget = IGuardTarget | Partial<ICustomElementType> | string;
export type GuardIdentity = number;

export interface IGuardOptions {
  type?: GuardTypes;
  include?: GuardTarget[];
  exclude?: GuardTarget[];
}

export class Guard {
  public type: GuardTypes;
  public includeTargets: Target[];
  public excludeTargets: Target[];
  public guard: GuardFunction;
  public id: GuardIdentity;

  constructor(guard: GuardFunction, options: IGuardOptions, id: GuardIdentity) {
    this.type = options.type || GuardTypes.Before;
    this.guard = guard;
    this.id = id;

    this.includeTargets = [];
    for (const target of options.include || []) {
      this.includeTargets.push(new Target(target));
    }
    this.excludeTargets = [];
    for (const target of options.exclude || []) {
      this.excludeTargets.push(new Target(target));
    }
  }

  public matches(viewportInstructions: ViewportInstruction[]): boolean {
    if (!this.includeTargets.length && !this.excludeTargets.length) {
      return true;
    }
    if (this.includeTargets.length) {
      return this.includeTargets.some(target => target.matches(viewportInstructions));
    } else {
      return !this.excludeTargets.some(target => target.matches(viewportInstructions));
    }
  }

  public check(viewportInstructions: ViewportInstruction[], navigationInstruction: INavigationInstruction): boolean | ViewportInstruction[] {
    return this.guard(viewportInstructions, navigationInstruction);
  }
}

export class Guardian {
  public guards: Record<GuardTypes, Guard[]> = { before: [] };

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

  public removeGuard(id: GuardIdentity): void {
    const index = this.guards.before.findIndex(guard => guard.id === id);
    if (index > -1) {
      this.guards.before.splice(index, 1);
    }
  }

  public passes(type: GuardTypes, viewportInstructions: ViewportInstruction[], navigationInstruction: INavigationInstruction): boolean | ViewportInstruction[] {
    let modified: boolean = false;
    for (const guard of this.guards[type]) {
      if (guard.matches(viewportInstructions)) {
        console.log('#### Guard matches:', guard);
        const outcome = guard.check(viewportInstructions, navigationInstruction);
        if (typeof outcome === 'boolean') {
          if (!outcome) {
            return false;
          }
        } else {
          viewportInstructions = outcome;
          modified = true;
          console.log('#### Instructions modified:', viewportInstructions);
        }
      }
    }
    return modified ? viewportInstructions : true;
  }
}
