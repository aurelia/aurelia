import { LifecycleFlags } from '@aurelia/runtime';
import { IRenderLocation } from '../../dom.js';
import { IViewFactory } from '../../templating/view.js';
import { IWorkTracker } from '../../app-root.js';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller.js';
import type { ICompiledRenderContext } from '../../templating/render-context.js';
import type { Instruction } from '../../renderer.js';
import type { INode } from '../../dom.js';
export declare class If implements ICustomAttributeViewModel {
    private readonly ifFactory;
    private readonly location;
    private readonly work;
    readonly id: number;
    elseFactory?: IViewFactory;
    elseView?: ISyntheticView;
    ifView?: ISyntheticView;
    view?: ISyntheticView;
    readonly $controller: ICustomAttributeController<this>;
    value: unknown;
    private pending;
    private wantsDeactivate;
    constructor(ifFactory: IViewFactory, location: IRenderLocation, work: IWorkTracker);
    attaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    private swap;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class Else {
    private readonly factory;
    readonly id: number;
    constructor(factory: IViewFactory);
    link(flags: LifecycleFlags, parentContext: ICompiledRenderContext, controller: IHydratableController, _childController: ICustomAttributeController, _target: INode, _instruction: Instruction): void;
}
//# sourceMappingURL=if.d.ts.map