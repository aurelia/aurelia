import { ILifecycle } from '../lifecycle';
import { IBindingTargetObserver, IObservable, IPropertySubscriber, LifecycleFlags } from '../observation';
export interface ComputedOverrides {
    static?: boolean;
    volatile?: boolean;
}
export declare type ComputedLookup = {
    computed?: Record<string, ComputedOverrides>;
};
export declare function computed(config: ComputedOverrides): PropertyDecorator;
export interface CustomSetterObserver extends IBindingTargetObserver {
}
export declare class CustomSetterObserver implements CustomSetterObserver {
    $nextFlush: this;
    currentValue: unknown;
    dispose: () => void;
    observing: boolean;
    obj: IObservable;
    oldValue: unknown;
    propertyKey: string;
    private descriptor;
    private lifecycle;
    constructor(obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor, lifecycle: ILifecycle);
    getValue(): unknown;
    setValue(newValue: unknown): void;
    flush(flags: LifecycleFlags): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    convertProperty(): void;
}
export interface GetterObserver extends IBindingTargetObserver {
}
//# sourceMappingURL=computed-observer.d.ts.map