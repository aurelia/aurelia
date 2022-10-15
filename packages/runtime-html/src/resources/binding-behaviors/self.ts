import { type BindingBehaviorInstance } from '@aurelia/runtime';
import { ListenerBinding } from '../../binding/listener-binding';
import { bindingBehavior } from '../binding-behavior';

import type { Scope } from '@aurelia/runtime';
import { createError } from '../../utilities';

export class SelfBindingBehavior implements BindingBehaviorInstance {
  public bind(_scope: Scope, binding: ListenerBinding): void {
    if (!(binding instanceof ListenerBinding)) {
      if (__DEV__)
        throw createError(`AUR0801: Self binding behavior only supports listener binding via trigger/capture command.`);
      else
        throw createError(`AUR0801`);
    }

    binding.self = true;
  }

  public unbind(_scope: Scope, binding: ListenerBinding): void {
    binding.self = false;
  }
}

bindingBehavior('self')(SelfBindingBehavior);
