import { IContainer, IRegistry, IResolver } from './di';
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

export type ResourceDescription<TDef> = Required<TDef>;

export type ResourcePartDescription<TDef> = TDef;

export interface IResourceType<TDef, TProto, TClass extends ConstructableClass<TProto, unknown> = ConstructableClass<TProto>> extends ConstructableClass<TProto, unknown>, IRegistry {
  readonly kind: IResourceKind<TDef, TProto, TClass>;
  readonly description: ResourceDescription<TDef>;
}

export interface IResourceDescriptions {
  find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null;
  create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null;
}

export class RuntimeCompilationResources implements IResourceDescriptions {
  private readonly context: IContainer;

  constructor(context: IContainer) {
    this.context = context;
  }

  public find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null {
    const key = kind.keyFrom(name);
    let resourceResolvers = (this.context as unknown as { resourceResolvers: Record<string, IResolver | undefined | null> }).resourceResolvers;
    let resolver = resourceResolvers[key];
    if (resolver === void 0) {
      resourceResolvers = (this.context as unknown as { root: { resourceResolvers: Record<string, IResolver | undefined | null> }}).root.resourceResolvers;
      resolver = resourceResolvers[key];
    }

    if (resolver != null && resolver.getFactory) {
      const factory = resolver.getFactory(this.context);

      if (factory != null) {
        const description = (factory.Type as IResourceType<TDef, TProto>).description;
        return description === undefined ? null : description;
      }
    }

    return null;
  }

  public create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null {
    const key = kind.keyFrom(name);
    let resourceResolvers = (this.context as unknown as { resourceResolvers: Record<string, IResolver | undefined | null> }).resourceResolvers;
    let resolver = resourceResolvers[key];
    if (resolver === undefined) {
      resourceResolvers = (this.context as unknown as { root: { resourceResolvers: Record<string, IResolver | undefined | null> }}).root.resourceResolvers;
      resolver = resourceResolvers[key];
    }

    if (resolver != null) {
      const instance = resolver.resolve(this.context, this.context);
      return instance === undefined ? null : instance;
    }

    return null;
  }
}
