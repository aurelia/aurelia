import { Class, Constructable, IContainer, Immutable, IRegistry } from '@aurelia/kernel';

export interface IResourceDefinition {
  name: string;
}

export interface IResourceKind<TSource, TProto, TClass extends Class<TProto, unknown> = Class<TProto>> {
  readonly name: string;
  keyFrom(name: string): string;
  isType<T>(Type: T & Partial<IResourceType<TSource, TProto>>): Type is T & TClass & IResourceType<TSource, TProto>;

  define<T>(name: string, ctor: T & Partial<IResourceType<TSource, TProto>>): T & TClass & IResourceType<TSource, TProto>;
  define<T>(definition: TSource, ctor: T & Partial<IResourceType<TSource, TProto>>): T & TClass & IResourceType<TSource, TProto>;
  define<T>(nameOrDefinition: string | TSource, ctor: T & Partial<IResourceType<TSource, TProto>>): T & TClass & IResourceType<TSource, TProto>;
}

export type ResourceDescription<TSource> = Immutable<Required<TSource>>;

export interface IResourceType<TSource, TProto, TClass extends Class<TProto, unknown> = Class<TProto>> extends Class<TProto, unknown>, IRegistry {
  readonly kind: IResourceKind<TSource, TProto, TClass>;
  readonly description: ResourceDescription<TSource>;
}

export interface IResourceDescriptions {
  find<TSource, TProto>(kind: IResourceKind<TSource, TProto>, name: string): ResourceDescription<TSource> | null;
  create<TSource, TProto>(kind: IResourceKind<TSource, TProto>, name: string): TProto;
}

export class RuntimeCompilationResources implements IResourceDescriptions {
  constructor(private context: IContainer) {}

  public find<TSource, TProto>(kind: IResourceKind<TSource, TProto>, name: string): ResourceDescription<TSource> | null {
    const key = kind.keyFrom(name);
    const resolver = this.context.getResolver(key, false);

    if (resolver !== null && resolver.getFactory) {
      const factory = resolver.getFactory(this.context);

      if (factory !== null) {
        const description = (factory.type as IResourceType<TSource, TProto>).description;
        return description === undefined ? null : description;
      }
    }

    return null;
  }

  public create<TSource, TProto>(kind: IResourceKind<TSource, TProto>, name: string): TProto {
    const key = kind.keyFrom(name);
    if (this.context.has(key, false)) {
      const instance = this.context.get<Constructable>(key);
      return instance === undefined ? null : instance;
    }
    return null;
  }
}
