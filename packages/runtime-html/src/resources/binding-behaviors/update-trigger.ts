import { type BindingBehaviorInstance, IObserverLocator, IBinding } from '@aurelia/runtime';
import { BindingMode } from '../../binding/interfaces-bindings';
import { EventSubscriber } from '../../observation/event-delegator';
import { NodeObserverConfig } from '../../observation/observer-locator';
import { bindingBehavior } from '../binding-behavior';

import type { Writable } from '@aurelia/kernel';
import type { Scope } from '@aurelia/runtime';
import { PropertyBinding } from '../../binding/property-binding';
import type { CheckedObserver } from '../../observation/checked-observer';
import type { SelectValueObserver } from '../../observation/select-value-observer';
import type { ValueAttributeObserver } from '../../observation/value-attribute-observer';
import { createError } from '../../utilities';

export type UpdateTriggerableObserver = (
  (ValueAttributeObserver & Required<ValueAttributeObserver>) |
  (CheckedObserver & Required<CheckedObserver>) |
  (SelectValueObserver & Required<SelectValueObserver>)
) & {
  originalHandler?: EventSubscriber;
};
type UpdateTriggerableBinding = PropertyBinding & {
  targetObserver: UpdateTriggerableObserver;
};

export class UpdateTriggerBindingBehavior implements BindingBehaviorInstance {
  /** @internal */ protected static inject = [IObserverLocator];
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  public constructor(
    observerLocator: IObserverLocator,
  ) {
    this._observerLocator = observerLocator;
  }

  public bind(_scope: Scope, binding: IBinding, ...events: string[]): void {
    if (events.length === 0) {
      if (__DEV__)
        throw createError(`AUR0802: The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:'blur'">`);
      else
        throw createError(`AUR0802`);
    }

    if (!(binding instanceof PropertyBinding) || !(binding.mode & BindingMode.fromView)) {
      if (__DEV__)
        throw createError(`AUR0803: The updateTrigger binding behavior can only be applied to two-way/ from-view bindings.`);
      else
        throw createError(`AUR0803`);
    }

    // ensure the binding's target observer has been set.
    const targetObserver = this._observerLocator.getObserver(binding.target, binding.targetProperty) as UpdateTriggerableObserver;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!targetObserver.handler) {
      if (__DEV__)
        throw createError(`AUR0804: The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.`);
      else
        throw createError(`AUR0804`);
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

  public unbind(_scope: Scope, binding: IBinding): void {
    const $binding = binding as UpdateTriggerableBinding;
    // restore the state of the binding.
    $binding.targetObserver.handler.dispose();
    ($binding.targetObserver as Writable<typeof $binding.targetObserver>).handler = $binding.targetObserver.originalHandler!;
    $binding.targetObserver.originalHandler = null!;
  }
}

bindingBehavior('updateTrigger')(UpdateTriggerBindingBehavior);
