import { IIndexable } from '@aurelia/kernel';
import { IPropertyObserver, IPropertySubscriber, LifecycleFlags } from '../observation';
export interface SetterObserver extends IPropertyObserver<IIndexable, string> {
}
export declare class SetterObserver implements SetterObserver {
    subscribe: (subscriber: IPropertySubscriber) => void;
    unsubscribe: (subscriber: IPropertySubscriber) => void;
    obj: IIndexable;
    propertyKey: string;
    constructor(obj: IIndexable, propertyKey: string);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
}
//# sourceMappingURL=setter-observer.d.ts.map