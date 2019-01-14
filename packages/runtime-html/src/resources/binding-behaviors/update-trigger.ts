import { InterfaceSymbol, IRegistry, Reporter } from '@aurelia/kernel';
import { Binding, BindingBehaviorResource, BindingMode, IDOM, IObserverLocator, IScope, LifecycleFlags } from '@aurelia/runtime';
import { CheckedObserver } from '../../observation/checked-observer';
import { EventSubscriber, IEventSubscriber } from '../../observation/event-manager';
import { SelectValueObserver } from '../../observation/select-value-observer';
import { ValueAttributeObserver } from '../../observation/value-attribute-observer';

export type UpdateTriggerableObserver = (
  (ValueAttributeObserver & Required<ValueAttributeObserver>) |
  (CheckedObserver & Required<CheckedObserver>) |
  (SelectValueObserver & Required<SelectValueObserver>)
  ) & {
  originalHandler?: IEventSubscriber;
};

export type UpdateTriggerableBinding = Binding & {
  targetObserver: UpdateTriggerableObserver;
};

export class UpdateTriggerBindingBehavior {
  public static readonly inject: ReadonlyArray<InterfaceSymbol<unknown>> = [IObserverLocator];

  public static register: IRegistry['register'];

  private readonly observerLocator: IObserverLocator;

  constructor(observerLocator: IObserverLocator) {
    this.observerLocator = observerLocator;
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding, ...events: string[]): void {
    if (events.length === 0) {
      throw Reporter.error(9);
    }

    if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
      throw Reporter.error(10);
    }

    // ensure the binding's target observer has been set.
    const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty) as UpdateTriggerableObserver;
    if (!targetObserver.handler) {
      throw Reporter.error(10);
    }

    binding.targetObserver = targetObserver;

    // stash the original element subscribe function.
    targetObserver.originalHandler = binding.targetObserver.handler;

    // replace the element subscribe function with one that uses the correct events.
    targetObserver.handler = new EventSubscriber(binding.locator.get(IDOM), events);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding): void {
    // restore the state of the binding.
    binding.targetObserver.handler.dispose();
    binding.targetObserver.handler = binding.targetObserver.originalHandler;
    binding.targetObserver.originalHandler = null;
  }
}
BindingBehaviorResource.define('updateTrigger', UpdateTriggerBindingBehavior);
