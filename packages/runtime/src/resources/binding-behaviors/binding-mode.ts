import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { BindingMode } from '../../binding/binding-mode';
import { IScope, LifecycleFlags } from '../../observation';
import { bindingBehavior } from '../binding-behavior';

const { oneTime, toView, fromView, twoWay } = BindingMode;

export type WithMode = { mode: BindingMode; originalMode?: BindingMode };

export abstract class BindingModeBehavior {
  private mode: BindingMode;

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

@bindingBehavior('oneTime')
export class OneTimeBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(oneTime);
  }
}

@bindingBehavior('toView')
export class ToViewBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(toView);
  }
}

@bindingBehavior('fromView')
export class FromViewBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(fromView);
  }
}

@bindingBehavior('twoWay')
export class TwoWayBindingBehavior extends BindingModeBehavior {
  public static register: IRegistry['register'];

  constructor() {
    super(twoWay);
  }
}
