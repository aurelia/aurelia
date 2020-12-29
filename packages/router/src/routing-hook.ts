/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { ComponentAppellation, IComponentAndOrViewportOrNothing, RouteableComponentType } from './interfaces.js';
import { RoutingInstruction } from './instructions/routing-instruction.js';
import { Navigation } from './navigation.js';
import { Viewport } from './viewport.js';
import { InstructionComponent } from './instructions/instruction-component.js';
import { InstructionViewport } from './instructions/instruction-viewport.js';

/**
 * Public API
 */
export type RoutingHookType = 'beforeNavigation' | 'transformFromUrl' | 'transformToUrl' | 'transformTitle';
/**
 * Public API
 */
export type BeforeNavigationHookFunction = (routingInstructions: RoutingInstruction[], navigationInstruction: Navigation) => Promise<boolean | RoutingInstruction[]>;
/**
 * Public API
 */
export type TransformFromUrlHookFunction = (url: string, navigationInstruction: Navigation) => Promise<string | RoutingInstruction[]>;
/**
 * Public API
 */
export type TransformToUrlHookFunction = (state: string | RoutingInstruction[], navigationInstruction: Navigation) => Promise<string | RoutingInstruction[]>;
/**
 * Public API
 */
export type TransformTitleHookFunction = (title: string | RoutingInstruction[], navigationInstruction: Navigation) => Promise<string | RoutingInstruction[]>;

/**
 * @internal
 */
export type RoutingHookFunction = BeforeNavigationHookFunction | TransformFromUrlHookFunction | TransformToUrlHookFunction | TransformTitleHookFunction;
/**
 * @internal
 */
export type RoutingHookParameter = string | RoutingInstruction[];
/**
 * @internal
 */
export type RoutingHookResult = boolean | string | RoutingInstruction[];

export type RoutingHookTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;

/**
 * Public API
 */
export type RoutingHookIdentity = number;

/**
 * Public API
 */
export interface IRoutingHookOptions {
  /**
   * What event/when to hook. Defaults to BeforeNavigation
   */
  type?: RoutingHookType;
  /**
   * What to hook. If omitted, everything is included
   */
  include?: RoutingHookTarget[];
  /**
   * What not to hook. If omitted, nothing is excluded
   */
  exclude?: RoutingHookTarget[];
}

/**
 * Public API
 */
export interface IRoutingHookDefinition {
  hook: RoutingHookFunction;
  options: IRoutingHookOptions;
}

/**
 * @internal - Shouldn't be used directly
 */
export class RoutingHook {
  public static hooks: Record<RoutingHookType, RoutingHook[]> = {
    beforeNavigation: [],
    transformFromUrl: [],
    transformToUrl: [],
    transformTitle: [],
  };

  private static lastIdentity: number = 0;

  public type: RoutingHookType = 'beforeNavigation';
  public includeTargets: Target[] = [];
  public excludeTargets: Target[] = [];

  public constructor(
    public hook: RoutingHookFunction,
    options: IRoutingHookOptions,
    public id: RoutingHookIdentity
  ) {
    if (options.type !== void 0) {
      this.type = options.type;
    }

    for (const target of options.include ?? []) {
      this.includeTargets.push(new Target(target));
    }
    for (const target of options.exclude ?? []) {
      this.excludeTargets.push(new Target(target));
    }
  }

  public static add(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static add(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static add(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static add(transformTitleHookFunction: TransformTitleHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static add(hookFunction: RoutingHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity;
  public static add(hookFunction: RoutingHookFunction, options?: IRoutingHookOptions): RoutingHookIdentity {
    const hook = new RoutingHook(hookFunction, options ?? {}, ++this.lastIdentity);

    this.hooks[hook.type].push(hook);

    return this.lastIdentity;
  }

  public static remove(id: RoutingHookIdentity): void {
    for (const type in this.hooks) {
      if (Object.prototype.hasOwnProperty.call(this.hooks, type)) {
        const index = this.hooks[type as RoutingHookType].findIndex(hook => hook.id === id);
        if (index >= 0) {
          this.hooks[type as RoutingHookType].splice(index, 1);
        }
      }
    }
  }

  public static removeAll(): void {
    for (const type in this.hooks) {
      this.hooks[type as RoutingHookType] = [];
    }
  }

  public static async invokeBeforeNavigation(routingInstructions: RoutingInstruction[], navigationInstruction: Navigation): Promise<boolean | RoutingInstruction[]> {
    return this.invoke('beforeNavigation', navigationInstruction, routingInstructions) as Promise<boolean | RoutingInstruction[]>;
  }
  public static async invokeTransformFromUrl(url: string, navigationInstruction: Navigation): Promise<string | RoutingInstruction[]> {
    return this.invoke('transformFromUrl', navigationInstruction, url) as Promise<string | RoutingInstruction[]>;
  }
  public static async invokeTransformToUrl(state: string | RoutingInstruction[], navigationInstruction: Navigation): Promise<string | RoutingInstruction[]> {
    return this.invoke('transformToUrl', navigationInstruction, state) as Promise<string | RoutingInstruction[]>;
  }
  public static async invokeTransformTitle(title: string | RoutingInstruction[], navigationInstruction: Navigation): Promise<string | RoutingInstruction[]> {
    return this.invoke('transformTitle', navigationInstruction, title) as Promise<string | RoutingInstruction[]>;
  }

  public static async invoke(type: RoutingHookType, navigationInstruction: Navigation, arg: RoutingHookParameter): Promise<RoutingHookResult> {
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

  public get wantsMatch(): boolean {
    return this.includeTargets.length > 0 || this.excludeTargets.length > 0;
  }

  public matches(routingInstructions: RoutingHookParameter): boolean {
    if (this.includeTargets.length && !this.includeTargets.some(target => target.matches(routingInstructions as RoutingInstruction[]))) {
      return false;
    }
    if (this.excludeTargets.length && this.excludeTargets.some(target => target.matches(routingInstructions as RoutingInstruction[]))) {
      return false;
    }
    return true;
  }

  public invoke(navigationInstruction: Navigation, arg: RoutingHookParameter): Promise<RoutingHookResult> {
    // TODO: Fix the type here
    return this.hook(arg as any, navigationInstruction);
  }
}

class Target {
  public componentType: RouteableComponentType | null = null;
  public componentName: string | null = null;
  public viewport: Viewport | null = null;
  public viewportName: string | null = null;

  public constructor(target: RoutingHookTarget) {
    if (typeof target === 'string') {
      this.componentName = target;
    } else if (InstructionComponent.isType(target as RouteableComponentType)) {
      this.componentType = target as RouteableComponentType;
      this.componentName = InstructionComponent.getName(target as RouteableComponentType);
    } else {
      const cvTarget = target as IComponentAndOrViewportOrNothing;
      if (cvTarget.component != null) {
        this.componentType = InstructionComponent.isType(cvTarget.component)
          ? InstructionComponent.getType(cvTarget.component)
          : null;
        this.componentName = InstructionComponent.getName(cvTarget.component);
      }
      if (cvTarget.viewport != null) {
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
