import { IController, ILifecycleTask, IRenderLocation, IViewFactory, LifecycleFlags } from '@aurelia/runtime';
import { HTMLDOM } from '../../dom';
export declare type PortalTarget<T extends ParentNode = ParentNode> = string | T | null | undefined;
export declare type PortalLifecycleCallback<T extends ParentNode = ParentNode> = (target: PortalTarget<T>, view: IController<T>) => void | Promise<void> | ILifecycleTask;
export declare class Portal<T extends ParentNode = ParentNode> {
    private readonly factory;
    private readonly originalLoc;
    private readonly dom;
    readonly id: number;
    target: PortalTarget<T>;
    renderContext: PortalTarget<T>;
    strict: boolean;
    deactivating?: PortalLifecycleCallback<T>;
    activating?: PortalLifecycleCallback<T>;
    deactivated?: PortalLifecycleCallback<T>;
    activated?: PortalLifecycleCallback<T>;
    callbackContext: unknown;
    readonly view: IController<T>;
    private task;
    private currentTarget?;
    private readonly $controller;
    constructor(factory: IViewFactory<T>, originalLoc: IRenderLocation<T>, dom: HTMLDOM);
    binding(flags: LifecycleFlags): ILifecycleTask;
    attached(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): ILifecycleTask;
    targetChanged(): void;
    private project;
    private activate;
    private deactivate;
    private resolveTarget;
}
//# sourceMappingURL=portal.d.ts.map