import { Class, Constructable, IContainer, Immutable, IRegistry, Omit } from '@aurelia/kernel';

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

// We can't make the template property immutable+required because it's a DOM type and we can't necessarily
// satisfy those constraints. This is a hacky workaround and we need something better for this.
export type ResourceDescription<TDef> =
  TDef extends { template: infer TTemplate } ?
  Immutable<Required<Omit<TDef, 'template'>>> & { template: TTemplate } :
  Immutable<Required<TDef>>;

export type ResourcePartDescription<TDef> =
  TDef extends { template: infer TTemplate } ?
  Immutable<Omit<TDef, 'template'>> & { template: TTemplate } :
  Immutable<TDef>;

export interface IResourceType<TDef, TProto, TClass extends Class<TProto, unknown> = Class<TProto>> extends Class<TProto, unknown>, IRegistry {
  readonly kind: IResourceKind<TDef, TProto, TClass>;
  readonly description: ResourceDescription<TDef>;
}

export interface IResourceDescriptions {
  find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null;
  create<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): TProto | null;
}

export class RuntimeCompilationResources implements IResourceDescriptions {
  private context: IContainer;

  constructor(context: IContainer) {
    this.context = context;
  }

  public find<TDef, TProto>(kind: IResourceKind<TDef, TProto>, name: string): ResourceDescription<TDef> | null {
    const key = kind.keyFrom(name);
    const resolver = this.context.getResolver(key, false);

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
    if (this.context.has(key, false)) {
      const instance = this.context.get<Constructable>(key);
      return instance === undefined ? null : instance;
    }
    return null;
  }
}
