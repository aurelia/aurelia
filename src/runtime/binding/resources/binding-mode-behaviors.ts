import { bindingBehavior } from '../binding-behavior';
import { Binding, BindingMode } from '../binding';
import { IScope } from '../binding-context';

class BindingModeBehavior {
  constructor(private mode: BindingMode) {}

  bind(binding: Binding, scope: IScope) {
    (<any>binding).originalMode = binding.mode;
    binding.mode = this.mode;
  }

  unbind(binding: Binding, scope: IScope) {
    binding.mode = (<any>binding).originalMode;
    (<any>binding).originalMode = null;
  }
}

@bindingBehavior('oneTime')
export class OneTimeBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(BindingMode.oneTime);
  }
}

@bindingBehavior('toView')
export class ToViewBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(BindingMode.toView);
  }
}

@bindingBehavior('fromView')
export class FromViewBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(BindingMode.fromView);
  }
}

@bindingBehavior('twoWay')
export class TwoWayBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(BindingMode.twoWay);
  }
}
