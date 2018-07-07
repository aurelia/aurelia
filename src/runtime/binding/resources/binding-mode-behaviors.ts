import { BindingMode } from '../binding-mode';
import { bindingBehavior } from '../binding-behavior';
import { Binding } from '../binding';
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

@bindingBehavior('oneWay')
export class OneWayBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(BindingMode.oneWay);
  }
}

@bindingBehavior('twoWay')
export class TwoWayBindingBehavior extends BindingModeBehavior {
  constructor() {
    super(BindingMode.twoWay);
  }
}
