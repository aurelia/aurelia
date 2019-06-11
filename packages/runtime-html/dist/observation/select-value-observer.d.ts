import { IBatchedCollectionSubscriber, IBindingTargetObserver, IDOM, ILifecycle, IndexMap, IObserverLocator, IPropertySubscriber, LifecycleFlags } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
declare function defaultMatcher(a: unknown, b: unknown): boolean;
export interface ISelectElement extends HTMLSelectElement {
    options: HTMLCollectionOf<IOptionElement> & Pick<HTMLOptionsCollection, 'length' | 'selectedIndex' | 'add' | 'remove'>;
    matcher?: typeof defaultMatcher;
}
export interface IOptionElement extends HTMLOptionElement {
    model?: unknown;
}
export interface SelectValueObserver extends IBindingTargetObserver<ISelectElement, string>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class SelectValueObserver implements SelectValueObserver {
    readonly isDOMObserver: true;
    readonly persistentFlags: LifecycleFlags;
    lifecycle: ILifecycle;
    obj: ISelectElement;
    handler: IEventSubscriber;
    observerLocator: IObserverLocator;
    currentValue: unknown;
    currentFlags: LifecycleFlags;
    oldValue: unknown;
    defaultValue: unknown;
    flush: () => void;
    private readonly dom;
    private arrayObserver;
    private nodeObserver;
    constructor(flags: LifecycleFlags, lifecycle: ILifecycle, obj: ISelectElement, handler: IEventSubscriber, observerLocator: IObserverLocator, dom: IDOM);
    getValue(): unknown;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    handleBatchedChange(indexMap: number[]): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    notify(flags: LifecycleFlags): void;
    handleEvent(): void;
    synchronizeOptions(indexMap?: IndexMap): void;
    synchronizeValue(): boolean;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    bind(): void;
    unbind(): void;
    handleNodeChange(): void;
}
export {};
//# sourceMappingURL=select-value-observer.d.ts.map