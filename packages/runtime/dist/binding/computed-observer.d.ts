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
    obj: IObservable;
    propertyKey: string;
    private descriptor;
    private lifecycle;
    $nextFlush: this;
    dispose: () => void;
    observing: boolean;
    currentValue: IIndexable | Primitive;
    oldValue: IIndexable | Primitive;
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