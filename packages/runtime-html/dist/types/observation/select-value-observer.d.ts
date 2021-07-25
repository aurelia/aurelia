import { LifecycleFlags as LF, AccessorType } from '@aurelia/runtime';
import type { INode } from '../dom';
import type { EventSubscriber } from './event-delegator';
import type { IObserver, IObserverLocator, ISubscriber, ISubscriberCollection, IWithFlushQueue, IFlushable, FlushQueue } from '@aurelia/runtime';
declare function defaultMatcher(a: unknown, b: unknown): boolean;
export interface ISelectElement extends HTMLSelectElement {
    options: HTMLCollectionOf<IOptionElement> & Pick<HTMLOptionsCollection, 'length' | 'selectedIndex' | 'add' | 'remove'>;
    matcher?: typeof defaultMatcher;
}
export interface IOptionElement extends HTMLOptionElement {
    model?: unknown;
}
export interface SelectValueObserver extends ISubscriberCollection {
}
export declare class SelectValueObserver implements IObserver, IFlushable, IWithFlushQueue {
    readonly handler: EventSubscriber;
    type: AccessorType;
    value: unknown;
    readonly obj: ISelectElement;
    readonly queue: FlushQueue;
    private readonly oL;
    constructor(obj: INode, _key: PropertyKey, handler: EventSubscriber, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LF): void;
    handleCollectionChange(): void;
    syncOptions(): void;
    syncValue(): boolean;
    private start;
    private stop;
    private _observeArray;
    handleEvent(): void;
    private _handleNodeChange;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    flush(): void;
}
export {};
//# sourceMappingURL=select-value-observer.d.ts.map