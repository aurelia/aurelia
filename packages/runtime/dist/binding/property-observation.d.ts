import { IIndexable, Primitive } from '@aurelia/kernel';
import { BindingFlags, IAccessor, IPropertyObserver, IPropertySubscriber, ISubscribable, MutationKind } from '../observation';
export declare class PrimitiveObserver implements IAccessor, ISubscribable<MutationKind.instance> {
    getValue: () => undefined | number;
    setValue: () => void;
    subscribe: () => void;
    unsubscribe: () => void;
    dispose: () => void;
    doNotCache: boolean;
    obj: Primitive;
    constructor(obj: Primitive, propertyKey: PropertyKey);
    private getStringLength;
    private returnUndefined;
}
export interface SetterObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class SetterObserver implements SetterObserver {
    subscribe: (subscriber: IPropertySubscriber) => void;
    unsubscribe: (subscriber: IPropertySubscriber) => void;
    obj: IIndexable;
    propertyKey: string;
    constructor(obj: IIndexable, propertyKey: string);
    getValue(): IIndexable | Primitive;
    setValue(newValue: IIndexable | Primitive, flags: BindingFlags): void;
}
export interface Observer extends IPropertyObserver<IIndexable, string> {
}
export declare class Observer implements Observer {
    obj: IIndexable;
    propertyKey: string;
    currentValue: IIndexable | Primitive;
    private callback;
    constructor(instance: object, propertyName: string, callbackName: string);
    getValue(): IIndexable | Primitive;
    setValue(newValue: IIndexable | Primitive, flags: BindingFlags): void;
}
//# sourceMappingURL=property-observation.d.ts.map