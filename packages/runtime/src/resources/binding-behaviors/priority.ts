import {
  IContainer,
  Registration,
} from '@aurelia/kernel';

import {
  PropertyBinding,
} from '../../binding/property-binding';
import {
  Priority,
} from '../../lifecycle';
import {
  BindingBehavior,
  IBindingBehaviorDefinition,
  IBindingBehaviorResource,
} from '../binding-behavior';

export class PriorityBindingBehavior {
  [id: number]: number | undefined;

  public static readonly kind: IBindingBehaviorResource = BindingBehavior;
  public static readonly description: Required<IBindingBehaviorDefinition> = Object.freeze({
    name: 'priority',
  });

  public static register(container: IContainer): void {
    container.register(Registration.singleton(`binding-behavior:priority`, this));
    container.register(Registration.singleton(this, this));
  }

  public bind(binding: PropertyBinding, priority: number | keyof typeof Priority = Priority.low): void {
    const { targetObserver } = binding;
    if (targetObserver != void 0) {
      this[binding.id] = targetObserver.priority;
      if (typeof priority === 'number') {
        targetObserver.priority = priority;
      } else {
        switch (priority) {
          case 'preempt':
            targetObserver.priority = Priority['preempt'];
            break;
          case 'high':
            targetObserver.priority = Priority['high'];
            break;
          case 'bind':
            targetObserver.priority = Priority['bind'];
            break;
          case 'attach':
            targetObserver.priority = Priority['attach'];
            break;
          case 'normal':
            targetObserver.priority = Priority['normal'];
            break;
          case 'propagate':
            targetObserver.priority = Priority['propagate'];
            break;
          case 'connect':
            targetObserver.priority = Priority['connect'];
            break;
          case 'low':
            targetObserver.priority = Priority['low'];
        }
      }
    }
  }

  public unbind(binding: PropertyBinding): void {
    if (binding.targetObserver != void 0) {
      binding.targetObserver.priority = this[binding.id];
    }
  }
}
