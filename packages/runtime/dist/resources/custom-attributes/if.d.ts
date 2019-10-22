import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
export declare class If<T extends INode = INode> {
    private readonly ifFactory;
    private readonly location;
    readonly id: number;
    elseFactory?: IViewFactory<T>;
    elseView?: IController<T>;
    ifView?: IController<T>;
    view?: IController<T>;
    $controller: IController<T>;
    private task;
    value: boolean;
    constructor(ifFactory: IViewFactory<T>, location: IRenderLocation<T>);
    binding(flags: LifecycleFlags): ILifecycleTask;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): ILifecycleTask;
    unbinding(flags: LifecycleFlags): ILifecycleTask;
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
    link(ifBehavior: If<T> | IController<T>): void;
}
//# sourceMappingURL=if.d.ts.map