import { InterfaceSymbol, IRegistry } from '@aurelia/kernel';
import { ForOfStatement } from '../../binding/ast';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IRenderable, IView, IViewFactory } from '../../lifecycle';
import { CollectionObserver, IBatchedCollectionSubscriber, IObservedArray, IScope, ObservedCollection } from '../../observation';
import { ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';
export interface Repeat<C extends ObservedCollection, T extends INode = INode> extends ICustomAttribute<T>, IBatchedCollectionSubscriber {
}
export declare class Repeat<C extends ObservedCollection = IObservedArray, T extends INode = INode> implements Repeat<C, T> {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    static readonly bindables: IAttributeDefinition['bindables'];
    static readonly kind: ICustomAttributeResource;
    static readonly description: AttributeDefinition;
    items: C;
    $scope: IScope;
    forOf: ForOfStatement;
    hasPendingInstanceMutation: boolean;
    local: string;
    location: IRenderLocation<T>;
    observer: CollectionObserver | null;
    renderable: IRenderable<T>;
    factory: IViewFactory<T>;
    views: IView<T>[];
    key: string | null;
    keyed: boolean;
    private persistentFlags;
    constructor(location: IRenderLocation<T>, renderable: IRenderable<T>, factory: IViewFactory<T>);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    itemsChanged(newValue: C, oldValue: C, flags: LifecycleFlags): void;
    handleBatchedChange(indexMap: number[] | null, flags: LifecycleFlags): void;
    private processViewsNonKeyed;
    private processViewsKeyed;
    private checkCollectionObserver;
}
//# sourceMappingURL=repeat.d.ts.map