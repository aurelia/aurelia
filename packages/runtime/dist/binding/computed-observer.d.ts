import { IIndexable, Primitive } from '@aurelia/kernel';
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
    currentValue: IIndexable | Primitive;
    dispose: () => void;
    observing: boolean;
    obj: IObservable;
    oldValue: IIndexable | Primitive;
    propertyKey: string;
    private descriptor;
    private lifecycle;
    constructor(obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor, lifecycle: ILifecycle);
    getValue(): IIndexable | Primitive;
    setValue(newValue: IIndexable | Primitive): void;
    flush(flags: LifecycleFlags): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
    convertProperty(): void;
}
export interface GetterObserver extends IBindingTargetObserver {
}
//# sourceMappingURL=computed-observer.d.ts.map