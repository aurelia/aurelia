import { IBinding, INodeObserverLocator, IObserverLocator, type BindingBehaviorInstance } from '@aurelia/runtime';
import { BindingMode } from '../../binding/interfaces-bindings';
import { NodeObserverLocator } from '../../observation/observer-locator';
import { bindingBehavior } from '../binding-behavior';

import type { Scope } from '@aurelia/runtime';
import { PropertyBinding } from '../../binding/property-binding';
import { createError } from '../../utilities';

export class UpdateTriggerBindingBehavior implements BindingBehaviorInstance {
  /** @internal */ protected static inject = [IObserverLocator, INodeObserverLocator];
  /** @internal */ private readonly _observerLocator: IObserverLocator;
  /** @internal */ private readonly _nodeObserverLocator: NodeObserverLocator;
  public constructor(
    observerLocator: IObserverLocator,
    nodeObserverLocator: INodeObserverLocator,
  ) {
    if (!(nodeObserverLocator instanceof NodeObserverLocator)) {
      throw createError('AURxxxx: updateTrigger binding behavior only works with the default implementation of Aurelia HTML observation. Implement your own node observation + updateTrigger');
    }
    this._observerLocator = observerLocator;
    this._nodeObserverLocator = nodeObserverLocator;
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
    const targetConfig = this._nodeObserverLocator.getNodeObserverConfig(
      binding.target as HTMLElement,
      binding.targetProperty,
    );
    // todo(bigopon): potentially updateTrigger can be used to teach Aurelia adhoc listening capability
    //                since event names are the only thing needed
    if (targetConfig == null) {
      if (__DEV__) {
        throw createError(`AURxxxx: node observer does not know how to use events to observe ${binding.target}@${binding.targetProperty}`);
      } else {
        throw createError(`AURxxxx`);
      }
    }
    const targetObserver = this._nodeObserverLocator.getNodeObserver(
      binding.target as HTMLElement,
      binding.targetProperty,
      this._observerLocator,
    )!; // the check on targetConfig ensures it's not null, save execessive check her

    targetObserver.useConfig({ readonly: targetConfig.readonly, default: targetConfig.default, events });

    binding.useTargetObserver(targetObserver);
  }
}

bindingBehavior('updateTrigger')(UpdateTriggerBindingBehavior);
