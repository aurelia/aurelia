import { LifecycleFlags } from '@aurelia/runtime';
import { IInstruction } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { ISyntheticView, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor, IComposableController } from '../../lifecycle';
import { ICompiledCompositionContext } from '../../templating/composition-context';
import { IViewFactory } from '../../templating/view';
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
    afterAttach(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void | Promise<void>;
    valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void;
    onCancel(initiator: IHydratedController, parent: IHydratedParentController, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare class Else {
    private readonly factory;
    readonly id: number;
    constructor(factory: IViewFactory);
    link(flags: LifecycleFlags, parentContext: ICompiledCompositionContext, controller: IComposableController, _childController: ICustomAttributeController, _target: INode, _instruction: IInstruction): void;
}
//# sourceMappingURL=if.d.ts.map