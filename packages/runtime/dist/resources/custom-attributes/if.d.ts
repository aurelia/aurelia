import { IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { CompositionCoordinator, IView, IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';
export interface If<T extends INode = INode> extends ICustomAttribute<T> {
}
export declare class If<T extends INode = INode> implements If<T> {
    static readonly register: IRegistry['register'];
    static readonly bindables: IAttributeDefinition['bindables'];
    static readonly kind: ICustomAttributeResource;
    static readonly description: AttributeDefinition;
    value: boolean;
    elseFactory: IViewFactory<T> | null;
    elseView: IView<T> | null;
    ifFactory: IViewFactory<T>;
    ifView: IView<T> | null;
    location: IRenderLocation<T>;
    coordinator: CompositionCoordinator;
    constructor(ifFactory: IViewFactory<T>, location: IRenderLocation<T>, coordinator: CompositionCoordinator);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
    caching(flags: LifecycleFlags): void;
    valueChanged(newValue: boolean, oldValue: boolean, flags: LifecycleFlags): void;
    flush(flags: LifecycleFlags): void;
}
export interface Else<T extends INode = INode> extends ICustomAttribute<T> {
}
export declare class Else<T extends INode = INode> implements Else<T> {
    static readonly register: IRegistry['register'];
    static readonly bindables: IAttributeDefinition['bindables'];
    static readonly kind: ICustomAttributeResource;
    static readonly description: AttributeDefinition;
    private factory;
    constructor(factory: IViewFactory<T>);
    link(ifBehavior: If<T>): void;
}
//# sourceMappingURL=if.d.ts.map