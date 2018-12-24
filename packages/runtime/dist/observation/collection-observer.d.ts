import { Collection, CollectionKind, IBindingTargetObserver, IPatch, IPropertySubscriber, LifecycleFlags } from '../observation';
export declare function collectionObserver(kind: CollectionKind.array | CollectionKind.set | CollectionKind.map): ClassDecorator;
export interface CollectionLengthObserver extends IBindingTargetObserver<Collection, string> {
}
/**
 * Temporary shortcut to let the @targetObserver decorator know that the length property is never on a DOM instance
 * TODO: add information to the observers so they don't need to consult the DOM
 */
declare const domStub: {
    isNodeInstance(value: unknown): false;
};
export declare class CollectionLengthObserver implements CollectionLengthObserver, IPatch {
    dom: typeof domStub;
    currentValue: number;
    currentFlags: LifecycleFlags;
    obj: Collection;
    propertyKey: 'length' | 'size';
    constructor(obj: Collection, propertyKey: 'length' | 'size');
    getValue(): number;
    setValueCore(newValue: number): void;
    patch(flags: LifecycleFlags): void;
    subscribe(subscriber: IPropertySubscriber): void;
    unsubscribe(subscriber: IPropertySubscriber): void;
}
export {};
//# sourceMappingURL=collection-observer.d.ts.map