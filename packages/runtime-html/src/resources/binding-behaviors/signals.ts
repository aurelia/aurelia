import { ISignaler } from '@aurelia/runtime';
import { bindingBehavior } from '../binding-behavior';
import { addSignalListener, createError, removeSignalListener } from '../../utilities';
import type { BindingBehaviorInstance, IBinding, IConnectableBinding, Scope } from '@aurelia/runtime';
import { resolve } from '@aurelia/kernel';

export class SignalBindingBehavior implements BindingBehaviorInstance {
  /** @internal */
  private readonly _lookup: Map<IBinding, string[]> = new Map();
  /** @internal */
  private readonly _signaler = resolve(ISignaler);

  public bind(scope: Scope, binding: IConnectableBinding, ...names: string[]): void {
    if (!('handleChange' in binding)) {
      if (__DEV__)
        /* istanbul ignore next */
        throw createError(`AUR0817: The signal behavior can only be used with bindings that have a "handleChange" method`);
      else
        throw createError(`AUR0817`);
    }
    if (names.length === 0) {
      if (__DEV__)
        /* istanbul ignore next */
        throw createError(`AUR0818: At least one signal name must be passed to the signal behavior, e.g. "expr & signal:'my-signal'"`);
      else
        throw createError(`AUR0818`);
    }

    this._lookup.set(binding, names);
    let name: string;
    for (name of names) {
      addSignalListener(this._signaler, name, binding);
    }
  }

  public unbind(scope: Scope, binding: IConnectableBinding): void {
    const names = this._lookup.get(binding)!;
    this._lookup.delete(binding);
    let name: string;
    for (name of names) {
      removeSignalListener(this._signaler, name, binding);
    }
  }
}

bindingBehavior('signal')(SignalBindingBehavior);
