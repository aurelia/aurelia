import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
declare abstract class FlagsTemplateController<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly flags;
    readonly id: number;
    readonly view: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>, flags: LifecycleFlags);
    beforeBind(flags: LifecycleFlags): ILifecycleTask;
    beforeAttach(flags: LifecycleFlags): void;
    beforeDetach(flags: LifecycleFlags): void;
    beforeUnbind(flags: LifecycleFlags): ILifecycleTask;
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