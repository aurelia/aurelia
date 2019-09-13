import { IContainer, IRegistry } from './di';
import { Constructable, ConstructableClass } from './interfaces';
export interface IResourceDefinition extends Object {
    name: string;
    aliases?: string[];
}
export interface IResourceKind<TDef, TProto, TClass extends ConstructableClass<TProto, unknown> = ConstructableClass<TProto>> {
    readonly name: string;
    keyFrom(name: string): string;
    isType<T>(Type: T & Partial<IResourceType<TDef, TProto>>): Type is T & TClass & IResourceType<TDef, TProto>;
    define<T extends Constructable>(name: string, ctor?: T): T & TClass & IResourceType<TDef, TProto>;
    define<T extends Constructable>(definition: TDef, ctor?: T): T & TClass & IResourceType<TDef, TProto>;
    define<T extends Constructable>(nameOrDefinition: string | TDef, ctor?: T): T & TClass & IResourceType<TDef, TProto>;
}
export declare type ResourceDescription<TDef> = Required<TDef>;
export declare type ResourcePartDescription<TDef> = TDef;
export interface IResourceType<TDef, TProto, TClass extends ConstructableClass<TProto, unknown> = ConstructableClass<TProto>> extends ConstructableClass<TProto, unknown>, IRegistry {
    readonly kind: IResourceKind<TDef, TProto, TClass>;
    readonly description: ResourceDescription<TDef>;
}
export interface IResourceDescriptions {
    find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null;
    create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null;
}
export declare class RuntimeCompilationResources implements IResourceDescriptions {
    private readonly context;
    constructor(context: IContainer);
    find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null;
    create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null;
}
//# sourceMappingURL=resource.d.ts.map