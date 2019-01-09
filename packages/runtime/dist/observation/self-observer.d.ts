import { IIndexable } from '@aurelia/kernel';
import { IPropertyObserver, LifecycleFlags } from '../observation';
export interface SelfObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class SelfObserver implements SelfObserver {
    obj: IIndexable;
    propertyKey: string;
    currentValue: unknown;
    private readonly callback;
    constructor(instance: object, propertyName: string, callbackName: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=self-observer.d.ts.map