import { BindingBehaviorInstance, IBinding } from '@aurelia/runtime';
import { fromView, oneTime, toView, twoWay, type BindingMode } from '../../binding/interfaces-bindings';
import { bindingBehavior } from '../binding-behavior';

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
  public get mode(): typeof BindingMode.oneTime { return oneTime; }
}

export class ToViewBindingBehavior extends BindingModeBehavior {
  public get mode(): typeof BindingMode.toView { return toView; }
}

export class FromViewBindingBehavior extends BindingModeBehavior {
  public get mode(): typeof BindingMode.fromView { return fromView; }
}

export class TwoWayBindingBehavior extends BindingModeBehavior {
  public get mode(): typeof BindingMode.twoWay { return twoWay; }
}

bindingBehavior('oneTime')(OneTimeBindingBehavior);
bindingBehavior('toView')(ToViewBindingBehavior);
bindingBehavior('fromView')(FromViewBindingBehavior);
bindingBehavior('twoWay')(TwoWayBindingBehavior);
