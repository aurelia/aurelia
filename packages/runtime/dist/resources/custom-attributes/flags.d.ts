import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel, IHydratedController, IHydratedParentController, ControllerVisitor } from '../../lifecycle';
declare abstract class FlagsTemplateController<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly flags;
    readonly id: number;
    view: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>, flags: LifecycleFlags);
    afterAttach(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    afterUnbind(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void | Promise<void>;
    onCancel(initiator: IHydratedController<T>, parent: IHydratedParentController<T>, flags: LifecycleFlags): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
}
export declare class InfrequentMutations<T extends INode = INode> extends FlagsTemplateController<T> {
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
}
export declare class FrequentMutations<T extends INode = INode> extends FlagsTemplateController<T> {
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
}
export declare class ObserveShallow<T extends INode = INode> extends FlagsTemplateController<T> {
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
}
export {};
//# sourceMappingURL=flags.d.ts.map