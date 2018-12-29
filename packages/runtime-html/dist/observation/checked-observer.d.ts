import { IBatchedCollectionSubscriber, IBindingTargetObserver, ILifecycle, IObserverLocator, IPropertySubscriber, LifecycleFlags, ObserversLookup, SetterObserver } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
import { ValueAttributeObserver } from './value-attribute-observer';
export interface IInputElement extends HTMLInputElement {
    model?: unknown;
    $observers?: ObserversLookup & {
        model?: SetterObserver;
        value?: ValueAttributeObserver;
    };
    matcher?: typeof defaultMatcher;
}
declare const defaultMatcher: (a: unknown, b: unknown) => boolean;
export interface CheckedObserver extends IBindingTargetObserver<IInputElement, string>, IBatchedCollectionSubscriber, IPropertySubscriber {
}
export declare class CheckedObserver implements CheckedObserver {
    readonly isDOMObserver: true;
    currentFlags: LifecycleFlags;
    currentValue: unknown;
    defaultValue: unknown;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: IInputElement;
    observerLocator: IObserverLocator;
    oldValue: unknown;
    private arrayObserver;
    private valueObserver;
    constructor(lifecycle: ILifecycle, obj: IInputElement, handler: IEventSubscriber, observerLocator: IObserverLocator);
    getValue(): unknown;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    handleBatchedChange(): void;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    synchronizeElement(): void;
    notify(flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    unbind(): void;
}
export {};
//# sourceMappingURL=checked-observer.d.ts.map