import { IRegistry } from '@aurelia/kernel';
import { ForOfStatement } from '../../binding/ast';
import { SetterObserver } from '../../binding/property-observation';
import { INode, IRenderLocation } from '../../dom';
import { IRenderable, IView, IViewFactory } from '../../lifecycle';
import { CollectionObserver, IBatchedCollectionSubscriber, IObservedArray, IScope, LifecycleFlags, ObservedCollection } from '../../observation';
import { ICustomAttribute } from '../custom-attribute';
export interface Repeat<T extends ObservedCollection> extends ICustomAttribute, IBatchedCollectionSubscriber {
}
export declare class Repeat<T extends ObservedCollection = IObservedArray> {
    static register: IRegistry['register'];
    items: T;
    $scope: IScope;
    $observers: {
        items: SetterObserver;
    };
    encapsulationSource: INode;
    forOf: ForOfStatement;
    hasPendingInstanceMutation: boolean;
    local: string;
    location: IRenderLocation;
    observer: CollectionObserver;
    renderable: IRenderable;
    factory: IViewFactory;
    views: IView[];
    constructor(location: IRenderLocation, renderable: IRenderable, factory: IViewFactory);
    binding(flags: LifecycleFlags): void;
    bound(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbound(flags: LifecycleFlags): void;
    itemsChanged(newValue: T, oldValue: T, flags: LifecycleFlags): void;
    handleBatchedChange(indexMap: number[] | null): void;
    private processViews;
    private checkCollectionObserver;
}
//# sourceMappingURL=repeat.d.ts.map