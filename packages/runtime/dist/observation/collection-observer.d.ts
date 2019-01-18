import { LifecycleFlags } from '../flags';
import { Collection, CollectionKind, IBindingTargetObserver, IPatch, IPropertySubscriber } from '../observation';
export declare function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator;
export interface CollectionLengthObserver extends IBindingTargetObserver<Collection, string> {
}
export declare class CollectionLengthObserver implements CollectionLengthObserver, IPatch {
    currentValue: number;
    obj: Collection;
    propertyKey: 'length' | 'size';
    constructor(obj: Collection, propertyKey: 'length' | 'size');
    getValue(): number;
    setValueCore(newValue: number): void;
    patch(flags: LifecycleFlags): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
}
//# sourceMappingURL=collection-observer.d.ts.map