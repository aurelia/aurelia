import { Collection, CollectionKind, IBindingTargetObserver, IPropertySubscriber, LifecycleFlags } from '../observation';
export declare function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator;
export interface CollectionLengthObserver extends IBindingTargetObserver<Collection, string> {
}
export declare class CollectionLengthObserver implements CollectionLengthObserver {
    currentValue: number;
    currentFlags: LifecycleFlags;
    obj: Collection;
    propertyKey: 'length' | 'size';
    constructor(obj: Collection, propertyKey: 'length' | 'size');
    getValue(): number;
    setValueCore(newValue: number): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
}
//# sourceMappingURL=collection-observer.d.ts.map