import { IIndexable } from '@aurelia/kernel';
import { IPropertyObserver, ISubscriber, AccessorType, ISubscribable, IAccessor, ISubscriberCollection, LifecycleFlags } from '../observation.js';
import { InterceptorFunc } from '../bindable.js';
export interface SetterObserver extends IPropertyObserver<IIndexable, string> {
}
/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
export declare class SetterObserver {
    readonly obj: IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    inBatch: boolean;
    observing: boolean;
    type: AccessorType;
    constructor(obj: IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushBatch(flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    start(): this;
    stop(): this;
}
export interface SetterNotifier extends ISubscriberCollection {
}
export declare class SetterNotifier implements IAccessor, ISubscribable {
    private readonly s?;
    type: AccessorType;
    constructor(s?: InterceptorFunc<unknown, unknown> | undefined);
    getValue(): unknown;
    setValue(value: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=setter-observer.d.ts.map