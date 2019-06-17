import { IContainer, Key } from '@aurelia/kernel';
import { IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { LifecycleFlags } from '../../flags';
import { IController, IViewFactory } from '../../lifecycle';
import { ILifecycleTask } from '../../lifecycle-task';
import { InlineObserversLookup } from '../../observation';
import { ICustomAttributeResource } from '../custom-attribute';
export declare class If<T extends INode = INode> {
    static readonly inject: readonly Key[];
    static readonly kind: ICustomAttributeResource;
    static readonly description: Required<IAttributeDefinition>;
    readonly id: number;
    value: boolean;
    readonly $observers: InlineObserversLookup<this>;
    elseFactory?: IViewFactory<T>;
    elseView?: IController<T>;
    ifFactory: IViewFactory<T>;
    ifView?: IController<T>;
    location: IRenderLocation<T>;
    readonly noProxy: true;
    view?: IController<T>;
    private task;
    $controller: IController<T>;
    private _value;
    constructor(ifFactory: IViewFactory<T>, location: IRenderLocation<T>);
    static register(container: IContainer): void;
    getValue(): boolean;
    setValue(newValue: boolean, flags: LifecycleFlags): void;
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
    static readonly inject: readonly Key[];
    static readonly kind: ICustomAttributeResource;
    static readonly description: Required<IAttributeDefinition>;
    private readonly factory;
    constructor(factory: IViewFactory<T>);
    static register(container: IContainer): void;
    link(ifBehavior: If<T> | IController<T>): void;
}
//# sourceMappingURL=if.d.ts.map