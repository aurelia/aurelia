import { BindingBehaviorInstance } from '@aurelia/runtime';
import { bindingBehavior } from '../binding-behavior';
import { BindingMode } from '../../binding/interfaces-bindings';

import type { Scope } from '@aurelia/runtime';
import type { PropertyBinding } from '../../binding/property-binding';

const originalModesMap = new Map<PropertyBinding, BindingMode>();

export abstract class BindingModeBehavior implements BindingBehaviorInstance {

  public constructor(
    private readonly mode: BindingMode,
  ) {}

  public bind(scope: Scope, binding: PropertyBinding): void {
    originalModesMap.set(binding, binding.mode);
    binding.mode = this.mode;
  }

  public unbind(scope: Scope, binding: PropertyBinding): void {
    binding.mode = originalModesMap.get(binding)!;
    originalModesMap.delete(binding);
  }
}

export class OneTimeBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.oneTime);
  }
}

export class ToViewBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.toView);
  }
}

export class FromViewBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.fromView);
  }
}

export class TwoWayBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.twoWay);
  }
}

bindingBehavior('oneTime')(OneTimeBindingBehavior);
bindingBehavior('toView')(ToViewBindingBehavior);
bindingBehavior('fromView')(FromViewBindingBehavior);
bindingBehavior('twoWay')(TwoWayBindingBehavior);
