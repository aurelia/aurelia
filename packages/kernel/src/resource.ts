import { IContainer, IRegistry, IResolver } from './di';
import { Class, Constructable, Immutable } from './interfaces';

export interface IResourceDefinition {
  name: string;
}

export interface IResourceKind<TDef, TProto, TClass extends Class<TProto, unknown> = Class<TProto>> {
  readonly name: string;
  keyFrom(name: string): string;
  isType<T>(Type: T & Partial<IResourceType<TDef, TProto>>): Type is T & TClass & IResourceType<TDef, TProto>;

  define<T extends Constructable>(name: string, ctor: T): T & TClass & IResourceType<TDef, TProto>;
  define<T extends Constructable>(definition: TDef, ctor: T): T & TClass & IResourceType<TDef, TProto>;
  define<T extends Constructable>(nameOrDefinition: string | TDef, ctor: T): T & TClass & IResourceType<TDef, TProto>;
}

export type ResourceDescription<TDef> = Immutable<Required<TDef>>;

export type ResourcePartDescription<TDef> = Immutable<TDef>;

export interface IResourceType<TDef, TProto, TClass extends Class<TProto, unknown> = Class<TProto>> extends Class<TProto, unknown>, IRegistry {
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
    const resourceLookup = (this.context as unknown as { resourceLookup: Record<string, IResolver> }).resourceLookup;
    let resolver = resourceLookup[key];
    if (resolver === undefined) {
      resolver = resourceLookup[key] = this.context.getResolver(key, false);
    }

    if (resolver !== null && resolver.getFactory) {
      const factory = resolver.getFactory(this.context);

      if (factory !== null) {
        const description = (factory.Type as IResourceType<TDef, TProto>).description;
        return description === undefined ? null : description;
      }
    }

    return null;
  }

  public create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null {
    const key = kind.keyFrom(name);
    const resourceLookup = (this.context as unknown as { resourceLookup: Record<string, IResolver> }).resourceLookup;
    let resolver = resourceLookup[key];
    if (resolver === undefined) {
      resolver = resourceLookup[key] = this.context.getResolver(key, false);
    }
    if (resolver !== null) {
      const instance = resolver.resolve(this.context, this.context);
      return instance === undefined ? null : instance;
    }
    return null;
  }
}
