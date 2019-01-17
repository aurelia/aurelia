import { IIndexable } from '@aurelia/kernel';
import { IPropertyObserver, LifecycleFlags } from '../observation';
export interface SelfObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class SelfObserver implements SelfObserver {
    readonly persistentFlags: LifecycleFlags;
    obj: IIndexable;
    propertyKey: string;
    currentValue: unknown;
    private readonly callback;
    constructor(flags: LifecycleFlags, instance: object, propertyName: string, callbackName: string);
    handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=self-observer.d.ts.map