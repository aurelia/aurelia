import { ICustomElementType } from '@aurelia/runtime';

import { GuardFunction, GuardIdentity, GuardTarget, GuardTypes, IGuardOptions, IGuardTarget } from './guardian';
import { INavigationInstruction } from './history-browser';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

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
    if (this.includeTargets.length && !this.includeTargets.some(target => target.matches(viewportInstructions))) {
      return false;
    }
    if (this.excludeTargets.length && this.excludeTargets.some(target => target.matches(viewportInstructions))) {
      return false;
    }
    return true;
  }

  public check(viewportInstructions: ViewportInstruction[], navigationInstruction: INavigationInstruction): boolean | ViewportInstruction[] {
    return this.guard(viewportInstructions, navigationInstruction);
  }
}

class Target {
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
    const instructions = viewportInstructions.slice();
    if (!instructions.length) {
      instructions.push(new ViewportInstruction(''));
    }
    for (const instruction of instructions) {
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
