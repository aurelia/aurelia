import { HookFunction, HookTarget, HookIdentity, HookTypes, IHookOptions, HookResult, HookParameter, } from './hook-manager';
import { IComponentAndOrViewportOrNothing, INavigatorInstruction, RouteableComponentType } from './interfaces';
import { ComponentAppellationResolver, ViewportHandleResolver } from './type-resolvers';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';

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

  public matches(viewportInstructions: HookParameter): boolean {
    if (this.includeTargets.length && !this.includeTargets.some(target => target.matches(viewportInstructions as ViewportInstruction[]))) {
      return false;
    }
    if (this.excludeTargets.length && this.excludeTargets.some(target => target.matches(viewportInstructions as ViewportInstruction[]))) {
      return false;
    }
    return true;
  }

  public invoke(navigationInstruction: INavigatorInstruction, arg: HookParameter): Promise<HookResult> {
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
    } else if (ComponentAppellationResolver.isType(target as RouteableComponentType)) {
      this.componentType = target as RouteableComponentType;
      this.componentName = ComponentAppellationResolver.getName(target as RouteableComponentType);
    } else {
      const cvTarget = target as IComponentAndOrViewportOrNothing;
      if (cvTarget.component) {
        this.componentType = ComponentAppellationResolver.isType(cvTarget.component)
          ? ComponentAppellationResolver.getType(cvTarget.component)
          : null;
        this.componentName = ComponentAppellationResolver.getName(cvTarget.component);
      }
      if (cvTarget.viewport) {
        this.viewport = ViewportHandleResolver.isInstance(cvTarget.viewport) ? cvTarget.viewport : null;
        this.viewportName = ViewportHandleResolver.getName(cvTarget.viewport);
      }
    }
  }

  public matches(viewportInstructions: ViewportInstruction[]): boolean {
    const instructions = viewportInstructions.slice();
    if (!instructions.length) {
      instructions.push(new ViewportInstruction(''));
    }
    for (const instruction of instructions) {
      if ((this.componentName !== null && this.componentName === instruction.componentName) ||
        (this.componentType !== null && this.componentType === instruction.componentType) ||
        (this.viewportName !== null && this.viewportName === instruction.viewportName) ||
        (this.viewport !== null && this.viewport === instruction.viewport)) {
        return true;
      }
    }
    return false;
  }
}
