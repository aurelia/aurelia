import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { ISyntheticView, IViewFactory, ICustomAttributeController, ICustomAttributeViewModel } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
export declare class If<T extends INode = INode> implements ICustomAttributeViewModel<T> {
    private readonly ifFactory;
    private readonly location;
    readonly id: number;
    elseFactory?: IViewFactory<T>;
    elseView?: ISyntheticView<T>;
    ifView?: ISyntheticView<T>;
    view?: ISyntheticView<T>;
    readonly $controller: ICustomAttributeController<T, this>;
    private task;
    value: boolean;
    constructor(ifFactory: IViewFactory<T>, location: IRenderLocation<T>);
    beforeBind(flags: LifecycleFlags): ILifecycleTask;
    beforeAttach(flags: LifecycleFlags): void;
    beforeDetach(flags: LifecycleFlags): ILifecycleTask;
    beforeUnbind(flags: LifecycleFlags): ILifecycleTask;
    caching(flags: LifecycleFlags): void;
    valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void;
    private swap;
    private deactivate;
    private activate;
    private bindView;
    private attachView;
}
export declare class Else<T extends INode = INode> {
    private readonly factory;
    readonly id: number;
    constructor(factory: IViewFactory<T>);
    link(ifBehavior: If<T> | ICustomAttributeController<T>): void;
}
//# sourceMappingURL=if.d.ts.map