import { IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IPropertyObserver, IPropertySubscriber } from '../observation';
export interface SetterObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class SetterObserver implements SetterObserver {
    subscribe: (subscriber: IPropertySubscriber) => void;
    unsubscribe: (subscriber: IPropertySubscriber) => void;
    readonly persistentFlags: LifecycleFlags;
    obj: IIndexable;
    propertyKey: string;
    constructor(flags: LifecycleFlags, obj: IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=setter-observer.d.ts.map