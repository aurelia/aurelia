import { Constructable } from '@aurelia/kernel';
import { GuardIdentity, GuardTypes, IGuardOptions, } from './guardian';
import { GuardFunction, GuardTarget, INavigatorInstruction, IRouteableComponentType, ComponentAppellationResolver, ViewportAppellationResolver, IComponentAndOrViewportOrNothing } from './interfaces';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

export class Guard {
  public type: GuardTypes;
  public includeTargets: Target<Constructable>[];
  public excludeTargets: Target<Constructable>[];
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

class Target<C extends Constructable> {
  public component?: IRouteableComponentType<C>;
  public componentName?: string;
  public viewport?: Viewport;
  public viewportName?: string;

  constructor(target: GuardTarget) {
    if (typeof target === 'string') {
      this.componentName = target;
    } else if (ComponentAppellationResolver.isType(target as IRouteableComponentType<C>)) {
      this.component = target as IRouteableComponentType<C>;
      this.componentName = ComponentAppellationResolver.getName(target as IRouteableComponentType<C>);
    } else {
      const cvTarget = target as IComponentAndOrViewportOrNothing;
      this.component = ComponentAppellationResolver.isType(cvTarget.component) ? ComponentAppellationResolver.getType(cvTarget.component as IRouteableComponentType<C>) : null;
      this.componentName = ComponentAppellationResolver.getName(cvTarget.component)
      this.viewport = ViewportAppellationResolver.isInstance(cvTarget.viewport) ? cvTarget.viewport as Viewport : null;
      this.viewportName = ViewportAppellationResolver.getName(cvTarget.viewport);
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
