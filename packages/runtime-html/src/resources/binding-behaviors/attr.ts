import { BindingBehaviorInstance, IBinding } from '@aurelia/runtime';
import { attrAccessor } from '../../observation/data-attribute-accessor';

import type { Scope } from '@aurelia/runtime';
import { PropertyBinding } from '../../binding/property-binding';
import { ErrorNames, createMappedError } from '../../errors';
import { BindingBehaviorStaticAuDefinition, behaviorTypeName } from '../binding-behavior';

export class AttrBindingBehavior implements BindingBehaviorInstance {
  public static readonly $au: BindingBehaviorStaticAuDefinition = {
    type: behaviorTypeName,
    name: 'attr',
  };

  public bind(_scope: Scope, binding: IBinding): void {
    if (!(binding instanceof PropertyBinding)) {
      throw createMappedError(ErrorNames.attr_behavior_invalid_binding, binding);
    }
    binding.useTargetObserver(attrAccessor);
  }
}
