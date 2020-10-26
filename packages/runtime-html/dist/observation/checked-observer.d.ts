import { CollectionKind, IAccessor, ICollectionObserver, IndexMap, ISubscriber, ISubscriberCollection, LifecycleFlags, SetterObserver, ITask, ILifecycle, AccessorType } from '@aurelia/runtime';
import { EventSubscriber } from './event-delegator';
import { ValueAttributeObserver } from './value-attribute-observer';
export interface IInputElement extends HTMLInputElement {
    model?: unknown;
    $observers?: {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
    matcher?: typeof defaultMatcher;
}
declare function defaultMatcher(a: unknown, b: unknown): boolean;
export interface CheckedObserver extends ISubscriberCollection {
}
export declare class CheckedObserver implements IAccessor {
    lifecycle: ILifecycle;
    readonly handler: EventSubscriber;
    readonly obj: IInputElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    task: ITask | null;
    type: AccessorType;
    collectionObserver?: ICollectionObserver<CollectionKind>;
    valueObserver?: ValueAttributeObserver | SetterObserver;
    constructor(flags: LifecycleFlags, lifecycle: ILifecycle, handler: EventSubscriber, obj: IInputElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    synchronizeElement(): void;
    handleEvent(): void;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export {};
//# sourceMappingURL=checked-observer.d.ts.map