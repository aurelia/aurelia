import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { bindingBehavior } from '../binding-behavior';

export type WithMode = { mode: BindingMode };

export abstract class BindingModeBehavior {
  private readonly originalModes: WeakMap<PropertyBinding, BindingMode> = new WeakMap();

  public constructor(
    private readonly mode: BindingMode,
  ) {}

  public bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding & WithMode): void {
    this.originalModes.set(binding, binding.mode);
    binding.mode = this.mode;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding & WithMode): void {
    binding.mode = this.originalModes.get(binding) as BindingMode;
  }
}

@bindingBehavior('oneTime')
export class OneTimeBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.oneTime);
  }
}

@bindingBehavior('toView')
export class ToViewBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.toView);
  }
}

@bindingBehavior('fromView')
export class FromViewBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.fromView);
  }
}

@bindingBehavior('twoWay')
export class TwoWayBindingBehavior extends BindingModeBehavior {
  public constructor() {
    super(BindingMode.twoWay);
  }
}
