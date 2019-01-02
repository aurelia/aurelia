import { IRegistry } from '@aurelia/kernel';
import { Binding, IObserverLocator, IScope, LifecycleFlags } from '@aurelia/runtime';
import { CheckedObserver } from '../../observation/checked-observer';
import { IEventSubscriber } from '../../observation/event-manager';
import { SelectValueObserver } from '../../observation/select-value-observer';
import { ValueAttributeObserver } from '../../observation/value-attribute-observer';
export declare type UpdateTriggerableObserver = ((ValueAttributeObserver & Required<ValueAttributeObserver>) | (CheckedObserver & Required<CheckedObserver>) | (SelectValueObserver & Required<SelectValueObserver>)) & {
    originalHandler?: IEventSubscriber;
};
export declare type UpdateTriggerableBinding = Binding & {
    targetObserver: UpdateTriggerableObserver;
};
export declare class UpdateTriggerBindingBehavior {
    static readonly inject: ReadonlyArray<Function>;
    static register: IRegistry['register'];
    private observerLocator;
    constructor(observerLocator: IObserverLocator);
    bind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding, ...events: string[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding): void;
}
//# sourceMappingURL=update-trigger.d.ts.map