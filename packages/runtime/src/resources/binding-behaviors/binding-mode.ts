import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { BindingMode } from '../../binding/binding-mode';
import { IScope, LifecycleFlags } from '../../observation';
import { BindingBehaviorResource } from '../binding-behavior';

const { oneTime, toView, fromView, twoWay } = BindingMode;

export type WithMode = { mode: BindingMode; originalMode?: BindingMode };

export abstract class BindingModeBehavior {
  private readonly mode: BindingMode;

  constructor(mode: BindingMode) {
    this.mode = mode;
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding & WithMode): void {
    binding.originalMode = binding.mode;
    binding.mode = this.mode;
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding & WithMode): void {
    binding.mode = binding.originalMode;
    binding.originalMode = null;
  }
}

export class OneTimeBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(oneTime);
  }
}
BindingBehaviorResource.define('oneTime', OneTimeBindingBehavior);

export class ToViewBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(toView);
  }
}
BindingBehaviorResource.define('toView', ToViewBindingBehavior);

export class FromViewBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(fromView);
  }
}
BindingBehaviorResource.define('fromView', FromViewBindingBehavior);

export class TwoWayBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(twoWay);
  }
}
BindingBehaviorResource.define('twoWay', TwoWayBindingBehavior);
