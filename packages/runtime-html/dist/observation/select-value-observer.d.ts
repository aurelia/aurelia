import { CollectionKind, IAccessor, ICollectionObserver, IndexMap, IObserverLocator, ISubscriber, ISubscriberCollection, LifecycleFlags as LF, AccessorType } from '@aurelia/runtime';
import { EventSubscriber } from './event-delegator';
import { IPlatform } from '../platform';
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
export declare class SelectValueObserver implements IAccessor {
    readonly observerLocator: IObserverLocator;
    readonly platform: IPlatform;
    readonly handler: EventSubscriber;
    readonly obj: ISelectElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LF;
    hasChanges: boolean;
    type: AccessorType;
    arrayObserver?: ICollectionObserver<CollectionKind.array>;
    nodeObserver?: MutationObserver;
    private observing;
    constructor(observerLocator: IObserverLocator, platform: IPlatform, handler: EventSubscriber, obj: ISelectElement);
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