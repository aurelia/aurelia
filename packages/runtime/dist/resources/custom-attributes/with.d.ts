import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
export declare class With<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly location;
    readonly id: number;
    view: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    value?: object;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    private activateView;
    onCancel(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
}
//# sourceMappingURL=with.d.ts.map