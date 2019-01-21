import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { LifecycleFlags } from '../../flags';
import { IObservable, IScope } from '../../observation';
import { BindingBehaviorResource } from '../binding-behavior';

type WithKey = IObservable & {
  key: string | null;
};

export class KeyedBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding, key: string): void {
    binding.persistentFlags |= LifecycleFlags.keyedMode;
    (binding.target as WithKey).key = key;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    binding.persistentFlags &= ~LifecycleFlags.keyedMode;
    (binding.target as WithKey).key = null;
  }
}

BindingBehaviorResource.define('keyed', KeyedBindingBehavior);
