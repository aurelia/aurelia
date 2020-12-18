/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { HookFunction, HookTarget, HookIdentity, HookTypes, IHookOptions, HookResult, HookParameter, } from './hook-manager.js';
import { IComponentAndOrViewportOrNothing, RouteableComponentType } from './interfaces.js';
import { Viewport } from './viewport.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { Navigation } from './navigation.js';
import { InstructionViewport } from './instructions/instruction-viewport.js';
import { InstructionComponent } from './instructions/instruction-component.js';

/**
 * @internal - Shouldn't be used directly
 */
export class Hook {
  public type: HookTypes = HookTypes.BeforeNavigation;
  public includeTargets: Target[] = [];
  public excludeTargets: Target[] = [];

  public constructor(
    public hook: HookFunction,
    options: IHookOptions,
    public id: HookIdentity
  ) {
    if (options.type !== void 0) {
      this.type = options.type;
    }

    for (const target of options.include || []) {
      this.includeTargets.push(new Target(target));
    }
    for (const target of options.exclude || []) {
      this.excludeTargets.push(new Target(target));
    }
  }

  public get wantsMatch(): boolean {
    return this.includeTargets.length > 0 || this.excludeTargets.length > 0;
  }

  public matches(routingInstructions: HookParameter): boolean {
    if (this.includeTargets.length && !this.includeTargets.some(target => target.matches(routingInstructions as RoutingInstruction[]))) {
      return false;
    }
    if (this.excludeTargets.length && this.excludeTargets.some(target => target.matches(routingInstructions as RoutingInstruction[]))) {
      return false;
    }
    return true;
  }

  public invoke(navigationInstruction: Navigation, arg: HookParameter): Promise<HookResult> {
    // TODO: Fix the type here
    return this.hook(arg as any, navigationInstruction);
  }
}

class Target {
  public componentType: RouteableComponentType | null = null;
  public componentName: string | null = null;
  public viewport: Viewport | null = null;
  public viewportName: string | null = null;

  public constructor(target: HookTarget) {
    if (typeof target === 'string') {
      this.componentName = target;
    } else if (InstructionComponent.isType(target as RouteableComponentType)) {
      this.componentType = target as RouteableComponentType;
      this.componentName = InstructionComponent.getName(target as RouteableComponentType);
    } else {
      const cvTarget = target as IComponentAndOrViewportOrNothing;
      if (cvTarget.component) {
        this.componentType = InstructionComponent.isType(cvTarget.component)
          ? InstructionComponent.getType(cvTarget.component)
          : null;
        this.componentName = InstructionComponent.getName(cvTarget.component);
      }
      if (cvTarget.viewport) {
        this.viewport = InstructionViewport.isInstance(cvTarget.viewport) ? cvTarget.viewport : null;
        this.viewportName = InstructionViewport.getName(cvTarget.viewport);
      }
    }
  }

  public matches(routingInstructions: RoutingInstruction[]): boolean {
    const instructions = routingInstructions.slice();
    if (!instructions.length) {
      // instructions.push(new RoutingInstruction(''));
      instructions.push(RoutingInstruction.create('') as RoutingInstruction);
    }
    for (const instruction of instructions) {
      if ((this.componentName !== null && this.componentName === instruction.component.name) ||
        (this.componentType !== null && this.componentType === instruction.component.type) ||
        (this.viewportName !== null && this.viewportName === instruction.viewport.name) ||
        (this.viewport !== null && this.viewport === instruction.viewport.instance)) {
        return true;
      }
    }
    return false;
  }
}
