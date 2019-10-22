import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory } from '../../lifecycle';
export declare class With<T extends INode = INode> {
    private readonly factory;
    private readonly location;
    readonly id: number;
    readonly view: IController<T>;
    private $controller;
    value?: object;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    private bindChild;
}
//# sourceMappingURL=with.d.ts.map