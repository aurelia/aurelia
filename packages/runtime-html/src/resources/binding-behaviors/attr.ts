import { IBinding } from '../../binding/interfaces-bindings';
import { attrAccessor } from '../../observation/data-attribute-accessor';

import { type Scope } from '../../binding/scope';
import { PropertyBinding } from '../../binding/property-binding';
import { ErrorNames, createMappedError } from '../../errors';
import { type BindingBehaviorInstance, type BindingBehaviorStaticAuDefinition, behaviorTypeName } from '../binding-behavior';

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
