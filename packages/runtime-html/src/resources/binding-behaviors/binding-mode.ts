import { BindingBehaviorInstance, IBinding } from '@aurelia/runtime';
import { bindingBehavior } from '../binding-behavior';
import { BindingMode } from '../../binding/interfaces-bindings';

import type { Scope } from '@aurelia/runtime';

const originalModesMap = new Map<IBinding & { mode: BindingMode }, BindingMode>();

export abstract class BindingModeBehavior implements BindingBehaviorInstance {
  public abstract readonly mode: BindingMode;

  public bind(scope: Scope, binding: IBinding & { mode: BindingMode }): void {
    originalModesMap.set(binding, binding.mode);
    binding.mode = this.mode;
  }

  public unbind(scope: Scope, binding: IBinding & { mode: BindingMode }): void {
    binding.mode = originalModesMap.get(binding)!;
    originalModesMap.delete(binding);
  }
}

export class OneTimeBindingBehavior extends BindingModeBehavior {
  public get mode() { return  BindingMode.oneTime; }
}

export class ToViewBindingBehavior extends BindingModeBehavior {
  public get mode() { return  BindingMode.toView; }
}

export class FromViewBindingBehavior extends BindingModeBehavior {
  public get mode() { return  BindingMode.fromView; }
}

export class TwoWayBindingBehavior extends BindingModeBehavior {
  public get mode() { return  BindingMode.twoWay; }
}

bindingBehavior('oneTime')(OneTimeBindingBehavior);
bindingBehavior('toView')(ToViewBindingBehavior);
bindingBehavior('fromView')(FromViewBindingBehavior);
bindingBehavior('twoWay')(TwoWayBindingBehavior);
