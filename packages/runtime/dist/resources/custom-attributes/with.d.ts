import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel } from '../../lifecycle';
export declare class With<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly factory;
    private readonly location;
    readonly id: number;
    readonly view: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    value?: object;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    beforeBind(flags: LifecycleFlags): void;
    beforeAttach(flags: LifecycleFlags): void;
    beforeDetach(flags: LifecycleFlags): void;
    beforeUnbind(flags: LifecycleFlags): void;
    private bindChild;
}
//# sourceMappingURL=with.d.ts.map