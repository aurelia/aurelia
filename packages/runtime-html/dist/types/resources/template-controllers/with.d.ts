import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../templating/controller.js';
export declare class With implements ICustomAttributeViewModel {
    private readonly factory;
    private readonly location;
    static inject: (import("@aurelia/kernel").InterfaceSymbol<IViewFactory> | import("@aurelia/kernel").InterfaceSymbol<IRenderLocation<ChildNode>>)[];
    readonly id: number;
    view: ISyntheticView;
    readonly $controller: ICustomAttributeController<this>;
    value?: object;
    constructor(factory: IViewFactory, location: IRenderLocation);
    valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
//# sourceMappingURL=with.d.ts.map