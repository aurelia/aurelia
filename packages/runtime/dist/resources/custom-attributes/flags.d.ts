import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
declare abstract class FlagsTemplateController<T extends INode = INode> {
    private readonly factory;
    private readonly flags;
    readonly id: number;
    readonly view: IController<T>;
    private $controller;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>, flags: LifecycleFlags);
    binding(flags: LifecycleFlags): ILifecycleTask;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): ILifecycleTask;
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