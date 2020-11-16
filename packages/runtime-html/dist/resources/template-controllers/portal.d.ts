import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IPlatform } from '../../platform.js';
import { IViewFactory } from '../../templating/view.js';
import type { ControllerVisitor, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ISyntheticView } from '../../templating/controller.js';
export declare type PortalTarget<T extends Node & ParentNode = Node & ParentNode> = string | T | null | undefined;
export declare type PortalLifecycleCallback = (target: PortalTarget, view: ISyntheticView) => void | Promise<void>;
export declare class Portal<T extends Node & ParentNode = Node & ParentNode> implements ICustomAttributeViewModel {
    private readonly factory;
    private readonly originalLoc;
    private readonly p;
    readonly $controller: ICustomAttributeController<this>;
    readonly id: number;
    target: PortalTarget;
    renderContext: PortalTarget;
    strict: boolean;
    deactivating?: PortalLifecycleCallback;
    activating?: PortalLifecycleCallback;
    deactivated?: PortalLifecycleCallback;
    activated?: PortalLifecycleCallback;
    callbackContext: unknown;
    view: ISyntheticView;
    private currentTarget?;
    constructor(factory: IViewFactory, originalLoc: IRenderLocation, p: IPlatform);
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    targetChanged(): void;
    private $activating;
    private activate;
    private $activated;
    private $deactivating;
    private deactivate;
    private $deactivated;
    private resolveTarget;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=portal.d.ts.map