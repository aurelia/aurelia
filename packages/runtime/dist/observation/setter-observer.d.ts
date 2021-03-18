import { AccessorType, LifecycleFlags } from '../observation.js';
import type { IIndexable } from '@aurelia/kernel';
import type { IAccessor, InterceptorFunc, ISubscriber, ISubscriberCollection } from '../observation.js';
import { FlushQueue, IFlushable, IWithFlushQueue } from './flush-queue.js';
export interface SetterObserver extends IAccessor, ISubscriberCollection {
}
/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
export declare class SetterObserver implements IWithFlushQueue, IFlushable {
    readonly obj: IIndexable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    observing: boolean;
    type: AccessorType;
    readonly queue: FlushQueue;
    private f;
    constructor(obj: IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    flush(): void;
    start(): this;
    stop(): this;
}
export interface SetterNotifier extends IAccessor, ISubscriberCollection {
}
export declare class SetterNotifier implements IAccessor, IWithFlushQueue, IFlushable {
    readonly type: AccessorType;
    readonly queue: FlushQueue;
    constructor(obj: object, callbackKey: PropertyKey, set: InterceptorFunc | undefined, initialValue: unknown);
    getValue(): unknown;
    setValue(value: unknown, flags: LifecycleFlags): void;
    flush(): void;
}
//# sourceMappingURL=setter-observer.d.ts.map