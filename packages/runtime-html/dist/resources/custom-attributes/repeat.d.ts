import { CollectionObserver, ForOfStatement, IndexMap, IObservedArray, LifecycleFlags as LF, ObservedCollection } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom';
import { ISyntheticView, ICustomAttributeController, IComposableController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
import { IViewFactory } from '../../templating/view';
declare type Items<C extends ObservedCollection = IObservedArray> = C | undefined;
export declare class Repeat<C extends ObservedCollection = IObservedArray> implements ICustomAttributeViewModel {
    location: IRenderLocation;
    composable: IComposableController;
    factory: IViewFactory;
    readonly id: number;
    hasPendingInstanceMutation: boolean;
    observer?: CollectionObserver;
    views: ISyntheticView[];
    key?: string;
    forOf: ForOfStatement;
    local: string;
    readonly $controller: ICustomAttributeController<this>;
    items: Items<C>;
    private normalizedItems?;
    constructor(location: IRenderLocation, composable: IComposableController, factory: IViewFactory);
    beforeBind(initiator: IHydratedController, parent: IHydratedParentController, flags: LF): void | Promise<void>;
    afterAttach(initiator: IHydratedController, parent: IHydratedParentController, flags: LF): void | Promise<void>;
    afterUnbind(initiator: IHydratedController, parent: IHydratedParentController, flags: LF): void | Promise<void>;
    itemsChanged(flags: LF): void;
    handleCollectionChange(indexMap: IndexMap | undefined, flags: LF): void;
    private checkCollectionObserver;
    private normalizeToArray;
    private activateAllViews;
    private deactivateAllViews;
    private deactivateAndRemoveViewsByKey;
    private createAndActivateAndSortViewsByKey;
    onCancel(initiator: IHydratedController, parent: IHydratedParentController, flags: LF): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export {};
//# sourceMappingURL=repeat.d.ts.map