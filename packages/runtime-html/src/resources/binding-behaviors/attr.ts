import { BindingBehaviorInstance, IBinding } from '@aurelia/runtime';
import { attrAccessor } from '../../observation/data-attribute-accessor';
import { bindingBehavior } from '../binding-behavior';

import type { Scope } from '@aurelia/runtime';
import { PropertyBinding } from '../../binding/property-binding';
import { createError } from '../../utilities';

export class AttrBindingBehavior implements BindingBehaviorInstance {
  public bind(_scope: Scope, binding: IBinding): void {
    if (!(binding instanceof PropertyBinding)) {
      if (__DEV__)
        /* istanbul ignore next */
        throw createError(`AURxxxx: & attr can be only used on property binding. It's used on ${binding.constructor.name}`);
      else
        throw createError(`AURxxxx`);
    }
    binding.useTargetObserver(attrAccessor);
  }
}
bindingBehavior('attr')(AttrBindingBehavior);
