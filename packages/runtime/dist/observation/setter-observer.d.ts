import { AccessorType, LifecycleFlags } from '../observation.js';
import type { IIndexable } from '@aurelia/kernel';
import type { IAccessor, InterceptorFunc, ISubscriber, ISubscriberCollection } from '../observation.js';
export interface SetterObserver extends IAccessor, ISubscriberCollection {
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
    subscribe(subscriber: ISubscriber): void;
    start(): this;
    stop(): this;
}
export interface SetterNotifier extends IAccessor, ISubscriberCollection {
}
export declare class SetterNotifier implements IAccessor {
    readonly type: AccessorType;
    constructor(obj: object, callbackKey: PropertyKey, set: InterceptorFunc | undefined, initialValue: unknown);
    getValue(): unknown;
    setValue(value: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=setter-observer.d.ts.map