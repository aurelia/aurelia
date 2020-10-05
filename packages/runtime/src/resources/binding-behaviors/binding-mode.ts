import { ILogger } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { bindingBehavior } from '../binding-behavior';

export abstract class BindingModeBehavior {
  private readonly originalModes: Map<PropertyBinding, BindingMode> = new Map();

  public constructor(
    protected readonly logger: ILogger,
    private readonly mode: BindingMode,
  ) {}

  public bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: PropertyBinding): void {
    this.logger.trace(`bind(%s, scope, hostScope, binding)`, flags);

    this.originalModes.set(binding, binding.mode);
    binding.mode = this.mode;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: PropertyBinding): void {
    this.logger.trace(`unbind(%s, scope, hostScope, binding)`, flags);

    binding.mode = this.originalModes.get(binding)!;
    this.originalModes.delete(binding);
  }
}

@bindingBehavior('oneTime')
export class OneTimeBindingBehavior extends BindingModeBehavior {
  public constructor(
    @ILogger logger: ILogger,
  ) {
    super(logger.scopeTo('OneTimeBindingBehavior'), BindingMode.oneTime);
  }
}

@bindingBehavior('toView')
export class ToViewBindingBehavior extends BindingModeBehavior {
  public constructor(
    @ILogger logger: ILogger,
  ) {
    super(logger.scopeTo('ToViewBindingBehavior'), BindingMode.toView);
  }
}

@bindingBehavior('fromView')
export class FromViewBindingBehavior extends BindingModeBehavior {
  public constructor(
    @ILogger logger: ILogger,
  ) {
    super(logger.scopeTo('FromViewBindingBehavior'), BindingMode.fromView);
  }
}

@bindingBehavior('twoWay')
export class TwoWayBindingBehavior extends BindingModeBehavior {
  public constructor(
    @ILogger logger: ILogger,
  ) {
    super(logger.scopeTo('TwoWayBindingBehavior'), BindingMode.twoWay);
  }
}
