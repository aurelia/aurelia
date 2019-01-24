import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { LifecycleFlags } from '../../flags';
import { IObservable, IScope } from '../../observation';
import { BindingBehaviorResource } from '../binding-behavior';

type WithKey = IObservable & {
  key: string | null;
  keyed?: boolean;
};

export class KeyedBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding, key: string): void {
    // key is a lie (at the moment), we don't actually use it
    (binding.target as WithKey).key = key;
    // we do use keyeD though
    (binding.target as WithKey).keyed = true;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    (binding.target as WithKey).key = null;
    (binding.target as WithKey).keyed = false;
  }
}

BindingBehaviorResource.define('keyed', KeyedBindingBehavior);
