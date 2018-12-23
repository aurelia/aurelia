import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { IScope, LifecycleFlags } from '../../observation';
import { CheckedObserver, SelectValueObserver, ValueAttributeObserver } from '../../observation/element-observation';
import { IEventSubscriber } from '../../observation/event-manager';
import { IObserverLocator } from '../../observation/observer-locator';
export declare type UpdateTriggerableObserver = ((ValueAttributeObserver & Required<ValueAttributeObserver>) | (CheckedObserver & Required<CheckedObserver>) | (SelectValueObserver & Required<SelectValueObserver>)) & {
    originalHandler?: IEventSubscriber;
};
export declare type UpdateTriggerableBinding = Binding & {
    targetObserver: UpdateTriggerableObserver;
};
export declare class UpdateTriggerBindingBehavior {
    static register: IRegistry['register'];
    private observerLocator;
    constructor(observerLocator: IObserverLocator);
    bind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding, ...events: string[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding): void;
}
//# sourceMappingURL=update-trigger.d.ts.map