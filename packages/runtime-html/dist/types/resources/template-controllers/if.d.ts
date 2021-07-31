import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import { IWorkTracker } from '../../app-root.js';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller.js';
import type { IInstruction } from '../../renderer.js';
import type { INode } from '../../dom.js';
export declare class If implements ICustomAttributeViewModel {
    private readonly ifFactory;
    private readonly location;
    private readonly work;
    static inject: (import("@aurelia/kernel").InterfaceSymbol<IViewFactory> | import("@aurelia/kernel").InterfaceSymbol<IRenderLocation<ChildNode>> | import("@aurelia/kernel").InterfaceSymbol<IWorkTracker>)[];
    readonly id: number;
    elseFactory?: IViewFactory;
    elseView?: ISyntheticView;
    ifView?: ISyntheticView;
    view?: ISyntheticView;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    /**
     * `false` to always dispose the existing `view` whenever the value of if changes to false
     */
    cache: boolean;
    private pending;
    private _wantsDeactivate;
    private _swapId;
    constructor(ifFactory: IViewFactory, location: IRenderLocation, work: IWorkTracker);
    attaching(initiator: IHydratedController, parent: IHydratedController, f: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    valueChanged(newValue: unknown, oldValue: unknown, f: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class Else implements ICustomAttributeViewModel {
    private readonly factory;
    static inject: import("@aurelia/kernel").InterfaceSymbol<IViewFactory>[];
    readonly id: number;
    constructor(factory: IViewFactory);
    link(controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
}
//# sourceMappingURL=if.d.ts.map