import { BindingFlags, CollectionObserver, ForOfStatement, IBatchedCollectionSubscriber, IChangeSet, IObservedArray, IScope, ObservedCollection, SetterObserver } from '../../binding';
import { INode, IRenderLocation } from '../../dom';
import { ICustomAttribute } from '../custom-attribute';
import { IAttachLifecycle, IDetachLifecycle } from '../lifecycle';
import { IRenderable } from '../renderable';
import { IView, IViewFactory } from '../view';
export interface Repeat<T extends ObservedCollection> extends ICustomAttribute, IBatchedCollectionSubscriber {
}
export declare class Repeat<T extends ObservedCollection = IObservedArray> {
    changeSet: IChangeSet;
    location: IRenderLocation;
    renderable: IRenderable;
    factory: IViewFactory;
    items: T;
    $isAttached: boolean;
    $isBound: boolean;
    $scope: IScope;
    $observers: {
        items: SetterObserver;
    };
    encapsulationSource: INode;
    views: IView[];
    observer: CollectionObserver;
    hasPendingInstanceMutation: boolean;
    forOf: ForOfStatement;
    local: string;
    constructor(changeSet: IChangeSet, location: IRenderLocation, renderable: IRenderable, factory: IViewFactory);
    bound(flags: BindingFlags): void;
    attaching(encapsulationSource: INode, lifecycle: IAttachLifecycle): void;
    detaching(lifecycle: IDetachLifecycle): void;
    unbound(flags: BindingFlags): void;
    itemsChanged(newValue: T, oldValue: T, flags: BindingFlags): void;
    handleBatchedChange(indexMap: number[] | null): void;
    private processViews;
    private checkCollectionObserver;
}
//# sourceMappingURL=repeat.d.ts.map