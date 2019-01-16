import { InterfaceSymbol, IRegistry } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../../definitions';
import { INode, IRenderLocation } from '../../dom';
import { IViewFactory } from '../../lifecycle';
import { LifecycleFlags } from '../../observation';
import { ICustomAttribute, ICustomAttributeResource } from '../custom-attribute';
export interface Replaceable<T extends INode = INode> extends ICustomAttribute<T> {
}
export declare class Replaceable<T extends INode = INode> implements Replaceable<T> {
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    static readonly register: IRegistry['register'];
    static readonly bindables: IAttributeDefinition['bindables'];
    static readonly kind: ICustomAttributeResource;
    static readonly description: AttributeDefinition;
    private readonly currentView;
    private readonly factory;
    constructor(factory: IViewFactory<T>, location: IRenderLocation<T>);
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): void;
    detaching(flags: LifecycleFlags): void;
    unbinding(flags: LifecycleFlags): void;
}
//# sourceMappingURL=replaceable.d.ts.map