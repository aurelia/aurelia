import { LifecycleFlags } from '@aurelia/runtime';
import { INode, IRenderLocation } from '../../dom';
import { Instruction } from '../../renderer';
import { ICompiledRenderContext } from '../../templating/render-context';
import { IViewFactory } from '../../templating/view';
import type { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IHydratableController } from '../../templating/controller';
export declare class If implements ICustomAttributeViewModel {
    private readonly ifFactory;
    private readonly location;
    readonly id: number;
    elseFactory?: IViewFactory;
    elseView?: ISyntheticView;
    ifView?: ISyntheticView;
    view?: ISyntheticView;
    readonly $controller: ICustomAttributeController<this>;
    value: boolean;
    constructor(ifFactory: IViewFactory, location: IRenderLocation);
    attaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void;
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