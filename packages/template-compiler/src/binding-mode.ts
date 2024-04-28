import { objectFreeze } from './utilities';

// Note: the oneTime binding now has a non-zero value for 2 reasons:
//  - plays nicer with bitwise operations (more consistent code, more explicit settings)
//  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
//
// Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
// This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
/**
 * Mode of a binding to operate
 * - 1 / one time - bindings should only update the target once
 * - 2 / to view - bindings should update the target and observe the source for changes to update again
 * - 3 / from view - bindings should update the source and observe the target for changes to update again
 * - 6 / two way - bindings should observe both target and source for changes to update the other side
 * - 0 / default - undecided mode, bindings, depends on the circumstance, may decide what to do accordingly
 */
export const BindingMode = /*@__PURE__*/ objectFreeze({
  /**
   * Unspecified mode, bindings may act differently with this mode
   */
  default: 0,
  oneTime: 1,
  toView: 2,
  fromView: 4,
  twoWay: 6,
} as const);

export type BindingMode = typeof BindingMode[keyof typeof BindingMode];

_START_CONST_ENUM();
/** @internal */export const enum InternalBindingMode {
  default = 0,
  oneTime = 1,
  toView = 2,
  fromView = 4,
  twoWay = 6,
}
_END_CONST_ENUM();
