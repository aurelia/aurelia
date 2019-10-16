import { IContainer, IResolver } from './di';
import { Constructable } from './interfaces';
import { Metadata } from './metadata';

export type ResourceType<
  TUserType extends Constructable = Constructable,
  TResInstance extends {} = {},
  TResType extends {} = {},
  TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>,
> = (
  new (...args: any[]) => TResInstance & TUserInstance
) & {
  readonly aliases?: readonly string[];
} & TResType & TUserType;

export type ResourceDefinition<
  TUserType extends Constructable = Constructable,
  TResInstance extends {} = {},
  TDef extends {} = {},
  TResType extends {} = {},
  TUserInstance extends InstanceType<TUserType> = InstanceType<TUserType>,
> = {
  readonly name: string;
  readonly Type: ResourceType<TUserType, TResInstance, TResType, TUserInstance>;
  readonly aliases?: readonly string[];
} & TDef;

export type PartialResourceDefinition<TDef extends {} = {}> = {
  readonly name: string;
  readonly aliases?: readonly string[];
} & TDef;

export interface IResourceKind<TType extends ResourceType, TDef extends ResourceDefinition> {
  readonly name: string;
  keyFrom(name: string): string;
}

export type ResourceDescription<TDef> = Required<TDef>;

export type ResourcePartDescription<TDef> = TDef;

export interface IResourceDescriptions {
  find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null;
  create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null;
}

export class RuntimeCompilationResources implements IResourceDescriptions {
  private readonly context: IContainer;

  public constructor(context: IContainer) {
    this.context = context;
  }

  public find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null {
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
        const description = factory.Type.description;
        return description === undefined ? null : description;
      }
    }

    return null;
  }

  public create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null {
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

const annotation = {
  name: 'au:annotation',
  appendTo(target: Constructable, key: string): void {
    const keys = Metadata.getOwn(annotation.name, target);
    if (keys === void 0) {
      Metadata.define(annotation.name, [key], target);
    } else {
      keys.push(key);
    }
  },
  set(target: Constructable, prop: string, value: unknown): void {
    Metadata.define(annotation.keyFor(prop), value, target);
  },
  get(target: Constructable, prop: string): unknown {
    return Metadata.getOwn(annotation.keyFor(prop), target);
  },
  getKeys(target: Constructable): readonly string[] {
    let keys = Metadata.getOwn(annotation.name, target);
    if (keys === void 0) {
      Metadata.define(annotation.name, keys = [], target);
    }
    return keys;
  },
  isKey(key: string): boolean {
    return key.startsWith(annotation.name);
  },
  keyFor(name: string, context?: string): string {
    if (context === void 0) {
      return `${annotation.name}:${name}`;
    }

    return `${annotation.name}:${name}:${context}`;
  },
};

const resource = {
  name: 'au:resource',
  appendTo(target: Constructable, key: string): void {
    const keys = Metadata.getOwn(resource.name, target);
    if (keys === void 0) {
      Metadata.define(resource.name, [key], target);
    } else {
      keys.push(key);
    }
  },
  getKeys(target: Constructable): readonly string[] {
    let keys = Metadata.getOwn(resource.name, target);
    if (keys === void 0) {
      Metadata.define(resource.name, keys = [], target);
    }
    return keys;
  },
  isKey(key: string): boolean {
    return key.startsWith(resource.name);
  },
  keyFor(name: string, context?: string): string {
    if (context === void 0) {
      return `${resource.name}:${name}`;
    }

    return `${resource.name}:${name}:${context}`;
  },
};

export const Protocol = {
  annotation,
  resource,
};

