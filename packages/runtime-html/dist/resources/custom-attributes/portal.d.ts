import { ILifecycleTask, IRenderLocation, IViewFactory, LifecycleFlags, ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel } from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';
export declare type PortalTarget<T extends ParentNode = ParentNode> = string | T | null | undefined;
export declare type PortalLifecycleCallback<T extends ParentNode = ParentNode> = (target: PortalTarget<T>, view: ISyntheticView<T>) => void | Promise<void> | ILifecycleTask;
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
    readonly view: ISyntheticView<T>;
    private task;
    private currentTarget?;
    constructor(factory: IViewFactory<T>, originalLoc: IRenderLocation<T>, dom: HTMLDOM);
    beforeBind(flags: LifecycleFlags): ILifecycleTask;
    afterAttach(flags: LifecycleFlags): void;
    beforeDetach(flags: LifecycleFlags): void;
    beforeUnbind(flags: LifecycleFlags): ILifecycleTask;
    targetChanged(): void;
    private project;
    private activate;
    private deactivate;
    private resolveTarget;
}
//# sourceMappingURL=portal.d.ts.map