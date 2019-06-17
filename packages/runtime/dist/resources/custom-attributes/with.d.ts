import { IContainer, Key } from '@aurelia/kernel';
import { IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory } from '../../lifecycle';
import { InlineObserversLookup } from '../../observation';
import { ICustomAttributeResource } from '../custom-attribute';
export declare class With<T extends INode = INode> {
    static readonly inject: readonly Key[];
    static readonly kind: ICustomAttributeResource;
    static readonly description: Required<IAttributeDefinition>;
    readonly id: number;
    value: object | undefined;
    readonly $observers: InlineObserversLookup<this>;
    readonly view: IController<T>;
    private readonly factory;
    private $controller;
    private _value;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    static register(container: IContainer): void;
    valueChanged(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    private bindChild;
}
//# sourceMappingURL=with.d.ts.map