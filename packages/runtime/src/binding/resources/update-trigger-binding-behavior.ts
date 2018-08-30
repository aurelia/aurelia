import { inject, Reporter } from '@aurelia/kernel';
import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { BindingMode } from '../binding-mode';
import { CheckedObserver, SelectValueObserver, ValueAttributeObserver } from '../element-observation';
import { EventSubscriber, IEventSubscriber } from '../event-manager';
import { IObserverLocator } from '../observer-locator';

export type UpdateTriggerableObserver = ((ValueAttributeObserver & Required<ValueAttributeObserver>) | (CheckedObserver & Required<CheckedObserver>) | (SelectValueObserver & Required<SelectValueObserver>)) & {
  originalHandler?: IEventSubscriber;
};

export type UpdateTriggerableBinding = Binding & {
  targetObserver: UpdateTriggerableObserver;
};

@bindingBehavior('updateTrigger')
@inject(IObserverLocator)
export class UpdateTriggerBindingBehavior {
  constructor(private observerLocator: IObserverLocator) {}

  public bind(flags: BindingFlags, scope: IScope, binding: UpdateTriggerableBinding, ...events: string[]) {
    if (events.length === 0) {
      throw Reporter.error(9);
    }

    if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
      throw Reporter.error(10);
    }

    // ensure the binding's target observer has been set.
    const targetObserver = <UpdateTriggerableObserver>this.observerLocator.getObserver(binding.target, binding.targetProperty);
    if (!targetObserver.handler) {
      throw Reporter.error(10);
    }

    binding.targetObserver = targetObserver;

    // stash the original element subscribe function.
    targetObserver.originalHandler = binding.targetObserver.handler;

    // replace the element subscribe function with one that uses the correct events.
    targetObserver.handler = new EventSubscriber(events);
  }

  public unbind(flags: BindingFlags, scope: IScope, binding: UpdateTriggerableBinding) {
    // restore the state of the binding.
    binding.targetObserver.handler.dispose();
    binding.targetObserver.handler = binding.targetObserver.originalHandler;
    binding.targetObserver.originalHandler = null;
  }
}
