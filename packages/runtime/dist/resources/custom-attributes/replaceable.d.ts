import { IContainer, Key } from '@aurelia/kernel';
import { IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { ICustomAttributeResource } from '../custom-attribute';
export declare class Replaceable<T extends INode = INode> {
    static readonly inject: readonly Key[];
    static readonly kind: ICustomAttributeResource;
    static readonly description: Required<IAttributeDefinition>;
    readonly id: number;
    readonly view: IController<T>;
    private readonly factory;
    private $controller;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    static register(container: IContainer): void;
    binding(flags: LifecycleFlags): ILifecycleTask;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): ILifecycleTask;
}
//# sourceMappingURL=replaceable.d.ts.map