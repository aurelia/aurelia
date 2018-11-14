import { Collection, CollectionKind, IBindingTargetObserver, IPropertySubscriber, LifecycleFlags } from '../observation';
export declare function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator;
export interface CollectionLengthObserver extends IBindingTargetObserver<any, string> {
}
export declare class CollectionLengthObserver implements CollectionLengthObserver {
    obj: Collection;
    propertyKey: 'length' | 'size';
    currentValue: number;
    currentFlags: LifecycleFlags;
    constructor(obj: Collection, propertyKey: 'length' | 'size');
    getValue(): number;
    setValueCore(newValue: number): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
}
//# sourceMappingURL=collection-observer.d.ts.map