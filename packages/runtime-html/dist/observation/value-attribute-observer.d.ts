import { IBindingTargetObserver, ILifecycle, IPropertySubscriber, LifecycleFlags } from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';
export interface ValueAttributeObserver extends IBindingTargetObserver<Node, string> {
}
export declare class ValueAttributeObserver implements ValueAttributeObserver {
    readonly isDOMObserver: true;
    currentFlags: LifecycleFlags;
    currentValue: unknown;
    defaultValue: unknown;
    oldValue: unknown;
    flush: () => void;
    handler: IEventSubscriber;
    lifecycle: ILifecycle;
    obj: Node;
    propertyKey: string;
    constructor(lifecycle: ILifecycle, obj: Node, propertyKey: string, handler: IEventSubscriber);
    getValue(): unknown;
    setValueCore(newValue: unknown, flags: LifecycleFlags): void;
    handleEvent(): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    private flushFileChanges;
}
//# sourceMappingURL=value-attribute-observer.d.ts.map