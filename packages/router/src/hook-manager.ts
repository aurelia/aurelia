import { NavigatorInstruction, ComponentAppellation, IComponentAndOrViewportOrNothing, RouteableComponentType } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
import { ComponentAppellationResolver, ViewportHandleResolver } from './type-resolvers';
import { Viewport } from './viewport';
/**
 * Public API
 */
export const enum HookTypes {
  BeforeNavigation = 'beforeNavigation',
  TransformFromUrl = 'transformFromUrl',
  TransformToUrl = 'transformToUrl',
}
/**
 * Public API
 */
export type BeforeNavigationHookFunction = (viewportInstructions: ViewportInstruction[], navigationInstruction: NavigatorInstruction) => Promise<boolean | ViewportInstruction[]>;
/**
 * Public API
 */
export type TransformFromUrlHookFunction = (url: string, navigationInstruction: NavigatorInstruction) => Promise<string | ViewportInstruction[]>;
/**
 * Public API
 */
export type TransformToUrlHookFunction = (state: string | ViewportInstruction[], navigationInstruction: NavigatorInstruction) => Promise<string | ViewportInstruction[]>;

/**
 * @internal
 */
export type HookFunction = BeforeNavigationHookFunction | TransformFromUrlHookFunction | TransformToUrlHookFunction;
/**
 * @internal
 */
export type HookParameter = string | ViewportInstruction[];
/**
 * @internal
 */
export type HookResult = boolean | string | ViewportInstruction[];

export type HookTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;

/**
 * Public API
 */
export type HookIdentity = number;

/**
 * Public API
 */
export interface IHookOptions {
  /**
   * What event/when to hook. Defaults to BeforeNavigation
   */
  type?: HookTypes;
  /**
   * What to hook. If omitted, everything is included
   */
  include?: HookTarget[];
  /**
   * What not to hook. If omitted, nothing is excluded
   */
  exclude?: HookTarget[];
}

/**
 * Public API
 */
export interface IHookDefinition {
  hook: HookFunction;
  options: IHookOptions;
}

/**
 * @internal - Shouldn't be used directly
 */
export class HookManager {
  public hooks: Record<HookTypes, Hook[]> = {
    beforeNavigation: [],
    transformFromUrl: [],
    transformToUrl: [],
  };

  private lastIdentity: number = 0;

  public addHook(
    beforeNavigationHookFunction: BeforeNavigationHookFunction,
    options?: IHookOptions,
  ): HookIdentity;
  public addHook(
    transformFromUrlHookFunction: TransformFromUrlHookFunction,
    options?: IHookOptions,
  ): HookIdentity;
  public addHook(
    transformToUrlHookFunction: TransformToUrlHookFunction,
    options?: IHookOptions,
  ): HookIdentity;
  public addHook(
    hookFunction: HookFunction, options?: IHookOptions,
  ): HookIdentity;
  public addHook(
    hookFunction: HookFunction, options?: IHookOptions,
  ): HookIdentity {
    const hook = new Hook(hookFunction, options || {}, ++this.lastIdentity);

    this.hooks[hook.type].push(hook);

    return this.lastIdentity;
  }

  public removeHook(id: HookIdentity): void {
    for (const type in this.hooks) {
      if (Object.prototype.hasOwnProperty.call(this.hooks, type)) {
        const index = this.hooks[type as HookTypes].findIndex(hook => hook.id === id);
        if (index >= 0) {
          this.hooks[type as HookTypes].splice(index, 1);
        }
      }
    }
  }

  public invokeBeforeNavigation(
    viewportInstructions: ViewportInstruction[],
    navigationInstruction: NavigatorInstruction,
  ): Promise<boolean | ViewportInstruction[]> {
    return this.invoke(HookTypes.BeforeNavigation, navigationInstruction, viewportInstructions) as Promise<boolean | ViewportInstruction[]>;
  }
  public invokeTransformFromUrl(
    url: string,
    navigationInstruction: NavigatorInstruction,
  ): Promise<string | ViewportInstruction[]> {
    return this.invoke(HookTypes.TransformFromUrl, navigationInstruction, url) as Promise<string | ViewportInstruction[]>;
  }
  public invokeTransformToUrl(
    state: string | ViewportInstruction[],
    navigationInstruction: NavigatorInstruction,
  ): Promise<string | ViewportInstruction[]> {
    return this.invoke(HookTypes.TransformToUrl, navigationInstruction, state) as Promise<string | ViewportInstruction[]>;
  }

  public async invoke(
    type: HookTypes,
    navigationInstruction: NavigatorInstruction,
    arg: HookParameter,
  ): Promise<HookResult> {
    for (const hook of this.hooks[type]) {
      if (!hook.wantsMatch || hook.matches(arg)) {
        const outcome = await hook.invoke(navigationInstruction, arg);
        if (typeof outcome === 'boolean') {
          if (!outcome) {
            return false;
          }
        } else {
          arg = outcome;
        }
      }
    }
    return arg;
  }
}

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

  public matches(viewportInstructions: HookParameter): boolean {
    if (this.includeTargets.length && !this.includeTargets.some(target => target.matches(viewportInstructions as ViewportInstruction[]))) {
      return false;
    }
    if (this.excludeTargets.length && this.excludeTargets.some(target => target.matches(viewportInstructions as ViewportInstruction[]))) {
      return false;
    }
    return true;
  }

  public invoke(navigationInstruction: NavigatorInstruction, arg: HookParameter): Promise<HookResult> {
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
