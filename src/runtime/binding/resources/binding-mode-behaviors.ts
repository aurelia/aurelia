import { BindingMode } from '../binding-mode';
import { bindingBehavior } from '../binding-behavior';
import { Binding } from '../binding';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';

const { oneTime, toView, fromView, twoWay } = BindingMode;

type WithMode = { mode: BindingMode, originalMode?: BindingMode };

class BindingModeBehavior {
  constructor(private mode: BindingMode) {}

  bind(flags: BindingFlags, scope: IScope, binding: Binding & WithMode) {
    binding.originalMode = binding.mode;
    binding.mode = this.mode;
  }

  unbind(flags: BindingFlags, scope: IScope, binding: Binding & WithMode) {
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
