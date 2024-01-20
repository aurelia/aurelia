import { State } from '../templating/controller';

// Note: the oneTime binding now has a non-zero value for 2 reasons:
//  - plays nicer with bitwise operations (more consistent code, more explicit settings)
//  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
//
// Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
// This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
export const oneTime     = 0b0001;
export const toView      = 0b0010;
export const fromView    = 0b0100;
export const twoWay      = 0b0110;
export const defaultMode = 0b1000;
/**
 * Mode of a binding to operate
 */
export const BindingMode = Object.freeze({
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
