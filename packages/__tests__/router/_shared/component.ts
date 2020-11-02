import { HookName, MaybeHookName } from './hook-invocation-tracker';
import { TransitionViewport } from './transition-viewport';

export type ComponentTimings = Map<HookName, number>;

export type TransitionComponent = {
  component: string;
  timings: ComponentTimings;
};

export class Component {
  public static Empty: Component = new Component('', false);

  public name: string;
  public timings: ComponentTimings;

  public constructor(transition: string | TransitionComponent | Component, public forceParallel: boolean) {
    if (transition instanceof Component) {
      this.name = transition.name;
      this.timings = transition.timings;
    } else {
      this.name = typeof transition === 'string' ? transition : transition.component;
      this.timings = (transition as TransitionComponent)?.timings;
    }
  }

  public get isEmpty(): boolean {
    return this.name === '';
  }

  public get isLifecycleSync(): boolean {
    return [...TransitionViewport.addHooks, ...TransitionViewport.removeHooks].every(hook => this.getTiming(hook) === void 0);
  }

  public getTiming(hook: HookName): number | undefined {
    const timing = this.timings?.get(hook);
    if (timing !== void 0) {
      return timing;
    }
    if (this.forceParallel) {
      return 0;
    }
  }

  public getTimed(...names: HookName[]): MaybeHookName[] {
    const hooks: (HookName | '')[] = [];
    for (const name of names) {
      const count = this.getTiming(name);
      hooks.push(name);
      if (count !== void 0) {
        hooks.push(...Array(count + 1).fill(''));
      }
    }
    return hooks;
  }
}
