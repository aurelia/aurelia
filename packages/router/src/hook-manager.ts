import { Hook } from './hook';
import { INavigatorInstruction, ComponentAppellation, IComponentAndOrViewportOrNothing } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
import { INode } from '@aurelia/runtime';

export const enum HookTypes {
  BeforeNavigation = 'beforeNavigation',
  TransformFromUrl = 'transformFromUrl',
  TransformToUrl = 'transformToUrl',
}
export type BeforeNavigationHookFunction<T extends INode> = (
  viewportInstructions: ViewportInstruction<T>[],
  navigationInstruction: INavigatorInstruction<T>,
) => Promise<boolean | ViewportInstruction<T>[]>;
export type TransformFromUrlHookFunction<T extends INode> = (
  url: string,
  navigationInstruction: INavigatorInstruction<T>,
) => Promise<string | ViewportInstruction<T>[]>;
export type TransformToUrlHookFunction<T extends INode> = (
  state: string | ViewportInstruction<T>[],
  navigationInstruction: INavigatorInstruction<T>,
) => Promise<string | ViewportInstruction<T>[]>;

export type HookFunction<T extends INode> = BeforeNavigationHookFunction<T> | TransformFromUrlHookFunction<T> | TransformToUrlHookFunction<T>;
export type HookParameter<T extends INode> = string | ViewportInstruction<T>[];
export type HookResult<T extends INode> = boolean | string | ViewportInstruction<T>[];

export type HookTarget<T extends INode> = ComponentAppellation<T> | IComponentAndOrViewportOrNothing<T>;

export type HookIdentity = number;

export interface IHookOptions<T extends INode> {
  /**
   * What event/when to hook. Defaults to BeforeNavigation
   */
  type?: HookTypes;
  /**
   * What to hook. If omitted, everything is included
   */
  include?: HookTarget<T>[];
  /**
   * What not to hook. If omitted, nothing is excluded
   */
  exclude?: HookTarget<T>[];
}

export interface IHookDefinition<T extends INode> {
  hook: HookFunction<T>;
  options: IHookOptions<T>;
}

export class HookManager<T extends INode> {
  public hooks: Record<HookTypes, Hook<T>[]> = {
    beforeNavigation: [],
    transformFromUrl: [],
    transformToUrl: [],
  };

  private lastIdentity: number = 0;

  public addHook(
    beforeNavigationHookFunction: BeforeNavigationHookFunction<T>,
    options?: IHookOptions<T>,
  ): HookIdentity;
  public addHook(
    transformFromUrlHookFunction: TransformFromUrlHookFunction<T>,
    options?: IHookOptions<T>,
  ): HookIdentity;
  public addHook(
    transformToUrlHookFunction: TransformToUrlHookFunction<T>,
    options?: IHookOptions<T>,
  ): HookIdentity;
  public addHook(
    hookFunction: HookFunction<T>, options?: IHookOptions<T>,
  ): HookIdentity;
  public addHook(
    hookFunction: HookFunction<T>, options?: IHookOptions<T>,
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
    viewportInstructions: ViewportInstruction<T>[],
    navigationInstruction: INavigatorInstruction<T>,
  ): Promise<boolean | ViewportInstruction<T>[]> {
    return this.invoke(HookTypes.BeforeNavigation, navigationInstruction, viewportInstructions) as Promise<boolean | ViewportInstruction<T>[]>;
  }
  public invokeTransformFromUrl(
    url: string,
    navigationInstruction: INavigatorInstruction<T>,
  ): Promise<string | ViewportInstruction<T>[]> {
    return this.invoke(HookTypes.TransformFromUrl, navigationInstruction, url) as Promise<string | ViewportInstruction<T>[]>;
  }
  public invokeTransformToUrl(
    state: string | ViewportInstruction<T>[],
    navigationInstruction: INavigatorInstruction<T>,
  ): Promise<string | ViewportInstruction<T>[]> {
    return this.invoke(HookTypes.TransformToUrl, navigationInstruction, state) as Promise<string | ViewportInstruction<T>[]>;
  }

  public async invoke(
    type: HookTypes,
    navigationInstruction: INavigatorInstruction<T>,
    arg: HookParameter<T>,
  ): Promise<HookResult<T>> {
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
