import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { bindingBehavior, BindingBehaviorInstance } from '../binding-behavior';

export abstract class BindingModeBehavior implements BindingBehaviorInstance {
  private readonly originalModes: Map<PropertyBinding, BindingMode> = new Map();

  public constructor(
    private readonly mode: BindingMode,
  ) {}

  public bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: PropertyBinding): void {
    this.originalModes.set(binding, binding.mode);
    binding.mode = this.mode;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: PropertyBinding): void {
    binding.mode = this.originalModes.get(binding)!;
    this.originalModes.delete(binding);
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
