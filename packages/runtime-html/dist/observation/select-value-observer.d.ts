import { CollectionKind, IAccessor, ICollectionObserver, IDOM, IndexMap, IObserverLocator, ISubscriber, ISubscriberCollection, LifecycleFlags, IScheduler, ITask } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
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
export declare class SelectValueObserver implements IAccessor<unknown> {
    readonly scheduler: IScheduler;
    readonly observerLocator: IObserverLocator;
    readonly dom: IDOM;
    readonly handler: IEventSubscriber;
    readonly obj: ISelectElement;
    currentValue: unknown;
    oldValue: unknown;
    readonly persistentFlags: LifecycleFlags;
    hasChanges: boolean;
    task: ITask | null;
    arrayObserver?: ICollectionObserver<CollectionKind.array>;
    nodeObserver?: MutationObserver;
    constructor(scheduler: IScheduler, flags: LifecycleFlags, observerLocator: IObserverLocator, dom: IDOM, handler: IEventSubscriber, obj: ISelectElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushChanges(flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    notify(flags: LifecycleFlags): void;
    handleEvent(): void;
    synchronizeOptions(indexMap?: IndexMap): void;
    synchronizeValue(): boolean;
    bind(flags: LifecycleFlags): void;
    unbind(flags: LifecycleFlags): void;
    handleNodeChange(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export {};
//# sourceMappingURL=select-value-observer.d.ts.map