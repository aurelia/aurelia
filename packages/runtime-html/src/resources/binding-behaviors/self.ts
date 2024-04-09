import { type BindingBehaviorInstance, type Scope } from '@aurelia/runtime';
import { ListenerBinding } from '../../binding/listener-binding';
import { BindingBehaviorStaticAuDefinition } from '../binding-behavior';

import { ErrorNames, createMappedError } from '../../errors';

export class SelfBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: 'binding-behavior',
    name: 'self',
  };

  public bind(_scope: Scope, binding: ListenerBinding): void {
    if (!(binding instanceof ListenerBinding)) {
      throw createMappedError(ErrorNames.self_behavior_invalid_usage);
    }

    binding.self = true;
  }

  public unbind(_scope: Scope, binding: ListenerBinding): void {
    binding.self = false;
  }
}
