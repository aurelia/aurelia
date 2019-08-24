import { Constructable } from '@aurelia/kernel';
import { GuardIdentity, GuardTypes, IGuardOptions, } from './guardian';
import { GuardFunction, GuardTarget, IComponentAndOrViewportOrNothing, INavigatorInstruction, IRouteableComponentType } from './interfaces';
import { ComponentAppellationResolver, ViewportHandleResolver } from './type-resolvers';
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

  public check(viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction): boolean | ViewportInstruction[] {
    return this.guard(viewportInstructions, navigationInstruction);
  }
}

class Target {
  public component?: IRouteableComponentType;
  public componentName?: string;
  public viewport?: Viewport;
  public viewportName?: string;

  constructor(target: GuardTarget) {
    if (typeof target === 'string') {
      this.componentName = target;
    } else if (ComponentAppellationResolver.isType(target as IRouteableComponentType)) {
      this.component = target as IRouteableComponentType;
      this.componentName = ComponentAppellationResolver.getName(target as IRouteableComponentType);
    } else {
      const cvTarget = target as IComponentAndOrViewportOrNothing;
      this.component = ComponentAppellationResolver.isType(cvTarget.component) ? ComponentAppellationResolver.getType(cvTarget.component as Constructable) : null;
      this.componentName = ComponentAppellationResolver.getName(cvTarget.component)
      this.viewport = ViewportHandleResolver.isInstance(cvTarget.viewport) ? cvTarget.viewport as Viewport : null;
      this.viewportName = ViewportHandleResolver.getName(cvTarget.viewport);
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
