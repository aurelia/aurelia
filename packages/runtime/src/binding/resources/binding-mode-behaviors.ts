import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { BindingMode } from '../binding-mode';

const { oneTime, toView, fromView, twoWay } = BindingMode;

export type WithMode = { mode: BindingMode, originalMode?: BindingMode };

export abstract class BindingModeBehavior {
  constructor(private mode: BindingMode) {}

  public bind(flags: BindingFlags, scope: IScope, binding: Binding & WithMode) {
    binding.originalMode = binding.mode;
    binding.mode = this.mode;
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: Binding & WithMode) {
    binding.mode = binding.originalMode;
    binding.originalMode = null;
  }
}

@bindingBehavior('oneTime')
export class OneTimeBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(oneTime);
  }
}

@bindingBehavior('toView')
export class ToViewBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(toView);
  }
}

@bindingBehavior('fromView')
export class FromViewBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(fromView);
  }
}

@bindingBehavior('twoWay')
export class TwoWayBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(twoWay);
  }
}
