import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
export declare class Replaceable<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly location;
    readonly id: number;
    view: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    onCancel(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
}
//# sourceMappingURL=replaceable.d.ts.map