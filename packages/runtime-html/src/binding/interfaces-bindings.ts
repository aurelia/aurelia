import { IDisposable, IServiceLocator } from '@aurelia/kernel';
import { State } from '../templating/controller';
import { objectFreeze } from '../utilities';
import { Scope } from '@aurelia/runtime';
import { TaskQueue } from '@aurelia/platform';

// Note: the oneTime binding now has a non-zero value for 2 reasons:
//  - plays nicer with bitwise operations (more consistent code, more explicit settings)
//  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
//
// Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
// This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
/** @internal */ export const oneTime     = 0b0001;
/** @internal */ export const toView      = 0b0010;
/** @internal */ export const fromView    = 0b0100;
/** @internal */ export const twoWay      = 0b0110;
/** @internal */ export const defaultMode = 0b1000;
/**
 * Mode of a binding to operate
 * - 1 / one time - bindings should only update the target once
 * - 2 / to view - bindings should update the target and observe the source for changes to update again
 * - 3 / from view - bindings should update the source and observe the target for changes to update again
 * - 6 / two way - bindings should observe both target and source for changes to update the other side
 * - 8 / default - undecided mode, bindings, depends on the circumstance, may decide what to do accordingly
 */
export const BindingMode = /*@__PURE__*/ objectFreeze({
  oneTime,
  toView,
  fromView,
  twoWay,
  /**
   * Unspecified mode, bindings may act differently with this mode
   */
  default: defaultMode,
} as const);
export type BindingMode = typeof BindingMode[keyof typeof BindingMode];

export interface IBindingController {
  readonly state: State;
}

export interface IBinding {
  readonly isBound: boolean;
  bind(scope: Scope): void;
  unbind(): void;
  get: IServiceLocator['get'];
  useScope?(scope: Scope): void;
  limit?(opts: IRateLimitOptions): IDisposable;
}

export interface IRateLimitOptions {
  type: 'throttle' | 'debounce';
  delay: number;
  queue: TaskQueue;
  now: () => number;
  signals: string[];
}
