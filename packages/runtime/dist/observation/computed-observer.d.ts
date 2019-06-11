import { IBindingTargetObserver, IObservable, ISubscriber } from '../observation';
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
    readonly obj: IObservable;
    readonly propertyKey: string;
    currentValue: unknown;
    oldValue: unknown;
    private readonly descriptor;
    private observing;
    constructor(obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor);
    setValue(newValue: unknown): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    convertProperty(): void;
}
export interface GetterObserver extends IBindingTargetObserver {
}
//# sourceMappingURL=computed-observer.d.ts.map