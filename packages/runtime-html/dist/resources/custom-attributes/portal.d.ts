import { IRenderLocation, IViewFactory, LifecycleFlags, ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';
export declare type PortalTarget<T extends ParentNode = ParentNode> = string | T | null | undefined;
export declare type PortalLifecycleCallback<T extends ParentNode = ParentNode> = (target: PortalTarget<T>, view: ISyntheticView<T>) => void | Promise<void>;
export declare class Portal<T extends ParentNode = ParentNode> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly originalLoc;
    private readonly dom;
    readonly $controller: ICustomAttributeController<T, this>;
    readonly id: number;
    target: PortalTarget<T>;
    renderContext: PortalTarget<T>;
    strict: boolean;
    deactivating?: PortalLifecycleCallback<T>;
    activating?: PortalLifecycleCallback<T>;
    deactivated?: PortalLifecycleCallback<T>;
    activated?: PortalLifecycleCallback<T>;
    callbackContext: unknown;
    view: ISyntheticView<T>;
    private currentTarget?;
    constructor(factory: IViewFactory<T>, originalLoc: IRenderLocation<T>, dom: HTMLDOM);
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    targetChanged(): void;
    private $activating;
    private activate;
    private $activated;
    private $deactivating;
    private deactivate;
    private $deactivated;
    private resolveTarget;
    onCancel(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
}
//# sourceMappingURL=portal.d.ts.map