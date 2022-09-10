import { BindingBehaviorInstance, BindingMode, LifecycleFlags } from '@aurelia/runtime';
import { bindingBehavior } from '../resources/binding-behavior';

import type { Scope } from '@aurelia/runtime';
import type { PropertyBinding } from '../binding/property-binding';

export abstract class BindingModeBehavior implements BindingBehaviorInstance {
  /** @internal */
  private readonly _originalModes: Map<PropertyBinding, BindingMode> = new Map();

  public constructor(
    private readonly mode: BindingMode,
  ) {}

  public bind(flags: LifecycleFlags, scope: Scope, binding: PropertyBinding): void {
    this._originalModes.set(binding, binding.mode);
    binding.mode = this.mode;
  }

  public unbind(flags: LifecycleFlags, scope: Scope, binding: PropertyBinding): void {
    binding.mode = this._originalModes.get(binding)!;
    this._originalModes.delete(binding);
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
