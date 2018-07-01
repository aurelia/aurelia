import { BindingMode } from '../binding/binding-mode';
import { EventSubscriber, IEventSubscriber } from '../binding/event-manager';
import { IObserverLocator } from '../binding/observer-locator';
import { Binding } from '../binding/binding';
import { IScope } from '../binding/binding-context';
import { ValueAttributeObserver } from '../binding/element-observation';
import { CheckedObserver } from '../binding/checked-observer';
import { SelectValueObserver } from '../binding/select-value-observer';
import { Reporter } from '../../kernel/reporter';
import { bindingBehavior } from '../decorators';
import { inject } from '../../kernel/di';

type UpdateTriggerableObserver = (ValueAttributeObserver | CheckedObserver | SelectValueObserver) & {
  originalHandler?: IEventSubscriber
};

type UpdateTriggerableBinding = Binding & {
  targetObserver: UpdateTriggerableObserver;
};

@bindingBehavior('updateTrigger')
@inject(IObserverLocator)
export class UpdateTriggerBindingBehavior {
  constructor(private observerLocator: IObserverLocator) {}

  bind(binding: UpdateTriggerableBinding, scope: IScope, ...events: string[]) {
    if (events.length === 0) {
      throw Reporter.error(9);
    }

    if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
      throw Reporter.error(10);
    }

    // ensure the binding's target observer has been set.
    let targetObserver = <UpdateTriggerableObserver>this.observerLocator.getObserver(binding.target, binding.targetProperty);
    if (!targetObserver.handler) {
      throw Reporter.error(10);
    }

    binding.targetObserver = targetObserver;

    // stash the original element subscribe function.
    targetObserver.originalHandler = binding.targetObserver.handler;

    // replace the element subscribe function with one that uses the correct events.
    targetObserver.handler = new EventSubscriber(events);
  }

  unbind(binding: UpdateTriggerableBinding, scope: IScope) {
    // restore the state of the binding.
    binding.targetObserver.handler.dispose();
    binding.targetObserver.handler = binding.targetObserver.originalHandler;
    binding.targetObserver.originalHandler = null;
  }
}
