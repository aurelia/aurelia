import { LifecycleFlags, AccessorType } from '@aurelia/runtime';
import type { IObserver, ISubscriber, ISubscriberCollection, IFlushable, IWithFlushQueue, FlushQueue } from '@aurelia/runtime';
export interface AttributeObserver extends IObserver, ISubscriber, ISubscriberCollection {
}
/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
export declare class AttributeObserver implements AttributeObserver, ElementMutationSubscriber, IWithFlushQueue, IFlushable {
    type: AccessorType;
    readonly queue: FlushQueue;
    constructor(obj: HTMLElement, prop: string, attr: string);
    getValue(): unknown;
    setValue(value: unknown, flags: LifecycleFlags): void;
    handleMutation(mutationRecords: MutationRecord[]): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    flush(): void;
}
interface ElementMutationSubscriber {
    handleMutation(mutationRecords: MutationRecord[]): void;
}
export {};
//# sourceMappingURL=element-attribute-observer.d.ts.map