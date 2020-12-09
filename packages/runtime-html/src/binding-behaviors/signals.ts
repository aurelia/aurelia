import { bindingBehavior, ISignaler, LifecycleFlags } from '@aurelia/runtime';
import type { BindingBehaviorInstance, IBinding, IConnectableBinding, Scope } from '@aurelia/runtime';

export class SignalBindingBehavior implements BindingBehaviorInstance {
  private readonly lookup: Map<IBinding, string[]> = new Map();

  public constructor(
    @ISignaler private readonly signaler: ISignaler,
  ) {}

  public bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IConnectableBinding, ...names: string[]): void {
    if (!('handleChange' in binding)) {
      throw new Error(`The signal behavior can only be used with bindings that have a 'handleChange' method`);
    }
    if (names.length === 0) {
      throw new Error(`At least one signal name must be passed to the signal behavior, e.g. \`expr & signal:'my-signal'\``);
    }

    this.lookup.set(binding, names);
    for (const name of names) {
      this.signaler.addSignalListener(name, binding);
    }
  }

  public unbind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IConnectableBinding): void {
    const names = this.lookup.get(binding)!;
    this.lookup.delete(binding);
    for (const name of names) {
      this.signaler.removeSignalListener(name, binding);
    }
  }
}

bindingBehavior('signal')(SignalBindingBehavior);
