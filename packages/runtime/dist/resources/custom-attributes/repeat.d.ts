import { ForOfStatement } from '../../binding/ast';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags as LF, LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, IRenderableController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
import { CollectionObserver, IndexMap, IObservedArray, ObservedCollection } from '../../observation';
declare type Items<C extends ObservedCollection = IObservedArray> = C | undefined;
export declare class Repeat<C extends ObservedCollection = IObservedArray, T extends INode = INode> implements ICustomAttributeViewModel<T> {
    location: IRenderLocation<T>;
    renderable: IRenderableController<T>;
    factory: IViewFactory<T>;
    readonly id: number;
    hasPendingInstanceMutation: boolean;
    observer?: CollectionObserver;
    views: ISyntheticView<T>[];
    key?: string;
    forOf: ForOfStatement;
    local: string;
    readonly $controller: ICustomAttributeController<T, this>;
    items: Items<C>;
    private normalizedItems?;
    constructor(location: IRenderLocation<T>, renderable: IRenderableController<T>, factory: IViewFactory<T>);
    beforeBind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    itemsChanged(flags: LF): void;
    handleCollectionChange(indexMap: IndexMap | undefined, flags: LF): void;
    private checkCollectionObserver;
    private normalizeToArray;
    private activateAllViews;
    private deactivateAllViews;
    private deactivateAndRemoveViewsByKey;
    private createAndActivateAndSortViewsByKey;
    onCancel(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
}
export {};
//# sourceMappingURL=repeat.d.ts.map