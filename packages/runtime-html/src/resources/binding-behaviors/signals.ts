import { ISignaler } from '../../binding/signaler';
import { type BindingBehaviorInstance, type BindingBehaviorStaticAuDefinition, behaviorTypeName } from '../binding-behavior';
import { addSignalListener, removeSignalListener } from '../../utilities';
import { type ISubscriber, type Scope } from '@aurelia/runtime';
import { resolve } from '@aurelia/kernel';
import { ErrorNames, createMappedError } from '../../errors';
import { IBinding } from '../../binding/interfaces-bindings';

type ISignalableBinding = IBinding & ISubscriber;

export class SignalBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: 'signal',
  };
  /** @internal */
  private readonly _lookup: Map<IBinding, string[]> = new Map();
  /** @internal */
  private readonly _signaler = resolve(ISignaler);

  public bind(scope: Scope, binding: IBinding, ...names: string[]): void {
    if (!('handleChange' in binding)) {
      throw createMappedError(ErrorNames.signal_behavior_invalid_usage);
    }
    if (names.length === 0) {
      throw createMappedError(ErrorNames.signal_behavior_no_signals);
    }

    this._lookup.set(binding, names);
    let name: string;
    for (name of names) {
      addSignalListener(this._signaler, name, binding as ISignalableBinding);
    }
  }

  public unbind(scope: Scope, binding: IBinding): void {
    const names = this._lookup.get(binding)!;
    this._lookup.delete(binding);
    let name: string;
    for (name of names) {
      removeSignalListener(this._signaler, name, binding as ISignalableBinding);
    }
  }
}
