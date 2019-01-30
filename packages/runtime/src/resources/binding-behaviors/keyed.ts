import { IRegistry } from '@aurelia/kernel';
import { LifecycleFlags } from '../../flags';
import { IBinding } from '../../lifecycle';
import { IObservable, IScope } from '../../observation';
import { BindingBehaviorResource } from '../binding-behavior';

type WithKey = IObservable & {
  key: string | null;
  keyed?: boolean;
};
type BindingWithKeyedTarget = IBinding & {
  target: WithKey;
};

export class KeyedBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: BindingWithKeyedTarget, key: string): void {
    // key is a lie (at the moment), we don't actually use it
    binding.target.key = key;
    // we do use keyeD though
    binding.target.keyed = true;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: BindingWithKeyedTarget): void {
    binding.target.key = null;
    binding.target.keyed = false;
  }
}

BindingBehaviorResource.define('keyed', KeyedBindingBehavior);
