import { type IBinding, fromView, oneTime, toView, twoWay, type BindingMode } from '../../binding/interfaces-bindings';
import { BindingBehaviorInstance, behaviorTypeName, type BindingBehaviorStaticAuDefinition } from '../binding-behavior';

import { type Scope } from '../../binding/scope';

const originalModesMap = new Map<IBinding & { mode: BindingMode }, BindingMode>();
const createConfig = (name: string): BindingBehaviorStaticAuDefinition => ({ type: behaviorTypeName, name });

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
  public static readonly $au = /*@__PURE__*/createConfig('oneTime');
  public get mode(): typeof BindingMode.oneTime { return oneTime; }
}

export class ToViewBindingBehavior extends BindingModeBehavior {
  public static readonly $au = /*@__PURE__*/createConfig('toView');
  public get mode(): typeof BindingMode.toView { return toView; }
}

export class FromViewBindingBehavior extends BindingModeBehavior {
  public static readonly $au = /*@__PURE__*/createConfig('fromView');
  public get mode(): typeof BindingMode.fromView { return fromView; }
}

export class TwoWayBindingBehavior extends BindingModeBehavior {
  public static readonly $au = /*@__PURE__*/createConfig('twoWay');
  public get mode(): typeof BindingMode.twoWay { return twoWay; }
}
