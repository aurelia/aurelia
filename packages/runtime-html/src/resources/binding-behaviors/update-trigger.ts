import { Writable } from '@aurelia/kernel';
import { BindingMode, IObserverLocator, LifecycleFlags, PropertyBinding, bindingBehavior } from '@aurelia/runtime';
import { CheckedObserver } from '../../observation/checked-observer.js';
import { EventSubscriber } from '../../observation/event-delegator.js';
import { SelectValueObserver } from '../../observation/select-value-observer.js';
import { ValueAttributeObserver } from '../../observation/value-attribute-observer.js';

import type { Scope } from '@aurelia/runtime';
import { NodeObserverConfig } from '../../observation/observer-locator.js';

export type UpdateTriggerableObserver = (
  (ValueAttributeObserver & Required<ValueAttributeObserver>) |
  (CheckedObserver & Required<CheckedObserver>) |
  (SelectValueObserver & Required<SelectValueObserver>)
) & {
  originalHandler?: EventSubscriber;
};

export type UpdateTriggerableBinding = PropertyBinding & {
  targetObserver: UpdateTriggerableObserver;
};

@bindingBehavior('updateTrigger')
export class UpdateTriggerBindingBehavior {

  public constructor(
    @IObserverLocator private readonly observerLocator: IObserverLocator
  ) {}

  public bind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: UpdateTriggerableBinding, ...events: string[]): void {
    if (events.length === 0) {
      throw new Error('The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">');
    }

    if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
      throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
    }

    // ensure the binding's target observer has been set.
    const targetObserver = this.observerLocator.getObserver(flags, binding.target, binding.targetProperty) as UpdateTriggerableObserver;
    if (!targetObserver.handler) {
      throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
    }

    binding.targetObserver = targetObserver;

    // stash the original element subscribe function.
    const originalHandler = targetObserver.handler;
    targetObserver.originalHandler = originalHandler;

    // replace the element subscribe function with one that uses the correct events.
    (targetObserver as Writable<typeof targetObserver>).handler = new EventSubscriber(new NodeObserverConfig({
      default: originalHandler.config.default,
      events,
      readonly: originalHandler.config.readonly
    }));
  }

  public unbind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: UpdateTriggerableBinding): void {
    // restore the state of the binding.
    binding.targetObserver.handler.dispose();
    (binding.targetObserver as Writable<typeof binding.targetObserver>).handler = binding.targetObserver.originalHandler!;
    binding.targetObserver.originalHandler = null!;
  }
}
