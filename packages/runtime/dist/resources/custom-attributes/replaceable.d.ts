import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
export declare class Replaceable<T extends INode = INode> {
    private readonly factory;
    private readonly location;
    readonly id: number;
    readonly view: IController<T>;
    private $controller;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    binding(flags: LifecycleFlags): ILifecycleTask;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): ILifecycleTask;
}
//# sourceMappingURL=replaceable.d.ts.map