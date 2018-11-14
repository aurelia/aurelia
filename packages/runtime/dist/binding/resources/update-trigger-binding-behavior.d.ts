import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
import { CheckedObserver, SelectValueObserver, ValueAttributeObserver } from '../element-observation';
import { IEventSubscriber } from '../event-manager';
import { IObserverLocator } from '../observer-locator';
export declare type UpdateTriggerableObserver = ((ValueAttributeObserver & Required<ValueAttributeObserver>) | (CheckedObserver & Required<CheckedObserver>) | (SelectValueObserver & Required<SelectValueObserver>)) & {
    originalHandler?: IEventSubscriber;
};
export declare type UpdateTriggerableBinding = Binding & {
    targetObserver: UpdateTriggerableObserver;
};
export declare class UpdateTriggerBindingBehavior {
    private observerLocator;
    constructor(observerLocator: IObserverLocator);
    bind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding, ...events: string[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding): void;
}
//# sourceMappingURL=update-trigger-binding-behavior.d.ts.map