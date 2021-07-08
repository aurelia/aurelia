import { IObserverLocator, LifecycleFlags } from '@aurelia/runtime';
import { EventSubscriber } from '../../observation/event-delegator.js';
import type { Scope } from '@aurelia/runtime';
import type { CheckedObserver } from '../../observation/checked-observer.js';
import type { SelectValueObserver } from '../../observation/select-value-observer.js';
import type { ValueAttributeObserver } from '../../observation/value-attribute-observer.js';
import type { PropertyBinding } from '../../binding/property-binding.js';
export declare type UpdateTriggerableObserver = ((ValueAttributeObserver & Required<ValueAttributeObserver>) | (CheckedObserver & Required<CheckedObserver>) | (SelectValueObserver & Required<SelectValueObserver>)) & {
    originalHandler?: EventSubscriber;
};
export declare type UpdateTriggerableBinding = PropertyBinding & {
    targetObserver: UpdateTriggerableObserver;
};
export declare class UpdateTriggerBindingBehavior {
    private readonly observerLocator;
    constructor(observerLocator: IObserverLocator);
    bind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: UpdateTriggerableBinding, ...events: string[]): void;
    unbind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: UpdateTriggerableBinding): void;
}
//# sourceMappingURL=update-trigger.d.ts.map