import { CollectionKind, LifecycleFlags as LF, AccessorType } from '@aurelia/runtime';
import { IPlatform } from '../platform.js';
import type { INode } from '../dom.js';
import type { EventSubscriber } from './event-delegator.js';
import type { IServiceLocator } from '@aurelia/kernel';
import type { ICollectionObserver, IndexMap, IObserver, IObserverLocator, ISubscriber, ISubscriberCollection } from '@aurelia/runtime';
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
export declare class SelectValueObserver implements IObserver {
    readonly handler: EventSubscriber;
    readonly observerLocator: IObserverLocator;
    currentValue: unknown;
    oldValue: unknown;
    readonly obj: ISelectElement;
    readonly persistentFlags: LF;
    readonly platform: IPlatform;
    hasChanges: boolean;
    type: AccessorType;
    arrayObserver?: ICollectionObserver<CollectionKind.array>;
    nodeObserver?: MutationObserver;
    private observing;
    constructor(obj: INode, _key: PropertyKey, handler: EventSubscriber, observerLocator: IObserverLocator, locator: IServiceLocator);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LF): void;
    flushChanges(flags: LF): void;
    handleCollectionChange(): void;
    notify(flags: LF): void;
    handleEvent(): void;
    synchronizeOptions(indexMap?: IndexMap): void;
    synchronizeValue(): boolean;
    private start;
    private stop;
    private observeArray;
    handleNodeChange(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export {};
//# sourceMappingURL=select-value-observer.d.ts.map