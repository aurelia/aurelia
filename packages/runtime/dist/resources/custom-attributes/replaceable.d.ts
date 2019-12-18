import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
export declare class Replaceable<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly location;
    readonly id: number;
    readonly view: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    beforeBind(flags: LifecycleFlags): ILifecycleTask;
    beforeAttach(flags: LifecycleFlags): void;
    beforeDetach(flags: LifecycleFlags): void;
    beforeUnbind(flags: LifecycleFlags): ILifecycleTask;
}
//# sourceMappingURL=replaceable.d.ts.map