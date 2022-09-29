import { ISignaler } from '@aurelia/runtime';
import { bindingBehavior } from '../binding-behavior';
import type { BindingBehaviorInstance, IBinding, IConnectableBinding, Scope } from '@aurelia/runtime';
import { createError } from '../../utilities';

export class SignalBindingBehavior implements BindingBehaviorInstance {
  /** @internal */
  protected static inject = [ISignaler];
  /** @internal */
  private readonly _lookup: Map<IBinding, string[]> = new Map();
  /** @internal */
  private readonly _signaler: ISignaler;

  public constructor(signaler: ISignaler) {
    this._signaler = signaler;
  }

  public bind(scope: Scope, binding: IConnectableBinding, ...names: string[]): void {
    if (!('handleChange' in binding)) {
      if (__DEV__)
        throw createError(`AUR0817: The signal behavior can only be used with bindings that have a "handleChange" method`);
      else
        throw createError(`AUR0817`);
    }
    if (names.length === 0) {
      if (__DEV__)
        throw createError(`AUR0818: At least one signal name must be passed to the signal behavior, e.g. "expr & signal:'my-signal'"`);
      else
        throw createError(`AUR0818`);
    }

    this._lookup.set(binding, names);
    let name: string;
    for (name of names) {
      this._signaler.addSignalListener(name, binding);
    }
  }

  public unbind(scope: Scope, binding: IConnectableBinding): void {
    const names = this._lookup.get(binding)!;
    this._lookup.delete(binding);
    let name: string;
    for (name of names) {
      this._signaler.removeSignalListener(name, binding);
    }
  }
}

bindingBehavior('signal')(SignalBindingBehavior);
