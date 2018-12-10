import { Class, IContainer, Immutable, IRegistry } from '@aurelia/kernel';
export interface IResourceDefinition {
    name: string;
}
export interface IResourceKind<TDef, TProto, TClass extends Class<TProto, unknown> = Class<TProto>> {
    readonly name: string;
    keyFrom(name: string): string;
    isType<T>(Type: T & Partial<IResourceType<TDef, TProto>>): Type is T & TClass & IResourceType<TDef, TProto>;
    define<T>(name: string, ctor: T & Partial<IResourceType<TDef, Partial<TProto>>>): T & TClass & IResourceType<TDef, TProto>;
    define<T>(definition: TDef, ctor: T & Partial<IResourceType<TDef, Partial<TProto>>>): T & TClass & IResourceType<TDef, TProto>;
    define<T>(nameOrDefinition: string | TDef, ctor: T & Partial<IResourceType<TDef, Partial<TProto>>>): T & TClass & IResourceType<TDef, TProto>;
}
export declare type ResourceDescription<TDef> = Immutable<Required<TDef>>;
export interface IResourceType<TDef, TProto, TClass extends Class<TProto, unknown> = Class<TProto>> extends Class<TProto, unknown>, IRegistry {
    readonly kind: IResourceKind<TDef, TProto, TClass>;
    readonly description: ResourceDescription<TDef>;
}
export interface IResourceDescriptions {
    find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null;
    create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null;
}
export declare class RuntimeCompilationResources implements IResourceDescriptions {
    private context;
    constructor(context: IContainer);
    find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null;
    create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null;
}
//# sourceMappingURL=resource.d.ts.map