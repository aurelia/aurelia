import { CollectionKind, IAccessor, ICollectionObserver, IDOM, ILifecycle, IndexMap, IObserverLocator, ISubscriber, ISubscriberCollection, LifecycleFlags, Priority } from '@aurelia/runtime';
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
    readonly lifecycle: ILifecycle;
    readonly observerLocator: IObserverLocator;
    readonly dom: IDOM;
    readonly handler: IEventSubscriber;
    readonly obj: ISelectElement;
    currentValue: unknown;
    oldValue: unknown;
    hasChanges: boolean;
    priority: Priority;
    arrayObserver?: ICollectionObserver<CollectionKind.array>;
    nodeObserver?: MutationObserver;
    constructor(lifecycle: ILifecycle, observerLocator: IObserverLocator, dom: IDOM, handler: IEventSubscriber, obj: ISelectElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    flushRAF(flags: LifecycleFlags): void;
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    notify(flags: LifecycleFlags): void;
    handleEvent(): void;
    synchronizeOptions(indexMap?: IndexMap): void;
    synchronizeValue(): boolean;
    bind(): void;
    unbind(): void;
    handleNodeChange(): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export {};
//# sourceMappingURL=select-value-observer.d.ts.map